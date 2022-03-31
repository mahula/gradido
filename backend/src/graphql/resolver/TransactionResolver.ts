/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Resolver, Query, Args, Authorized, Ctx, Mutation } from 'type-graphql'
import { getCustomRepository, getConnection } from '@dbTools/typeorm'

import { sendTransactionReceivedEmail } from '@/mailer/sendTransactionReceivedEmail'

import { Transaction } from '@model/Transaction'
import { TransactionList } from '@model/TransactionList'

import TransactionSendArgs from '@arg/TransactionSendArgs'
import Paginated from '@arg/Paginated'

import { Order } from '@enum/Order'

import { TransactionRepository } from '@repository/Transaction'
import { TransactionLinkRepository } from '@repository/TransactionLink'

import { User as dbUser } from '@entity/User'
import { Transaction as dbTransaction } from '@entity/Transaction'
import { TransactionLink as dbTransactionLink } from '@entity/TransactionLink'

import { TransactionTypeId } from '@enum/TransactionTypeId'
import { calculateBalance, isHexPublicKey } from '@/util/validate'
import { RIGHTS } from '@/auth/RIGHTS'
import { User } from '@model/User'
import { communityUser } from '@/util/communityUser'
import { virtualLinkTransaction, virtualDecayTransaction } from '@/util/virtualTransactions'
import Decimal from 'decimal.js-light'

import { BalanceResolver } from './BalanceResolver'

const MEMO_MAX_CHARS = 255
const MEMO_MIN_CHARS = 5

export const executeTransaction = async (
  amount: Decimal,
  memo: string,
  sender: dbUser,
  recipient: dbUser,
  transactionLink?: dbTransactionLink | null,
): Promise<boolean> => {
  if (sender.id === recipient.id) {
    throw new Error('Sender and Recipient are the same.')
  }

  if (memo.length > MEMO_MAX_CHARS) {
    throw new Error(`memo text is too long (${MEMO_MAX_CHARS} characters maximum)`)
  }

  if (memo.length < MEMO_MIN_CHARS) {
    throw new Error(`memo text is too short (${MEMO_MIN_CHARS} characters minimum)`)
  }

  // validate amount
  const receivedCallDate = new Date()
  const sendBalance = await calculateBalance(sender.id, amount.mul(-1), receivedCallDate)
  if (!sendBalance) {
    throw new Error("user hasn't enough GDD or amount is < 0")
  }

  const queryRunner = getConnection().createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction('READ UNCOMMITTED')
  try {
    // transaction
    const transactionSend = new dbTransaction()
    transactionSend.typeId = TransactionTypeId.SEND
    transactionSend.memo = memo
    transactionSend.userId = sender.id
    transactionSend.linkedUserId = recipient.id
    transactionSend.amount = amount.mul(-1)
    transactionSend.balance = sendBalance.balance
    transactionSend.balanceDate = receivedCallDate
    transactionSend.decay = sendBalance.decay.decay
    transactionSend.decayStart = sendBalance.decay.start
    transactionSend.previous = sendBalance.lastTransactionId
    transactionSend.transactionLinkId = transactionLink ? transactionLink.id : null
    await queryRunner.manager.insert(dbTransaction, transactionSend)

    const transactionReceive = new dbTransaction()
    transactionReceive.typeId = TransactionTypeId.RECEIVE
    transactionReceive.memo = memo
    transactionReceive.userId = recipient.id
    transactionReceive.linkedUserId = sender.id
    transactionReceive.amount = amount
    const receiveBalance = await calculateBalance(recipient.id, amount, receivedCallDate)
    transactionReceive.balance = receiveBalance ? receiveBalance.balance : amount
    transactionReceive.balanceDate = receivedCallDate
    transactionReceive.decay = receiveBalance ? receiveBalance.decay.decay : new Decimal(0)
    transactionReceive.decayStart = receiveBalance ? receiveBalance.decay.start : null
    transactionReceive.previous = receiveBalance ? receiveBalance.lastTransactionId : null
    transactionReceive.linkedTransactionId = transactionSend.id
    transactionReceive.transactionLinkId = transactionLink ? transactionLink.id : null
    await queryRunner.manager.insert(dbTransaction, transactionReceive)

    // Save linked transaction id for send
    transactionSend.linkedTransactionId = transactionReceive.id
    await queryRunner.manager.update(dbTransaction, { id: transactionSend.id }, transactionSend)

    if (transactionLink) {
      transactionLink.redeemedAt = receivedCallDate
      transactionLink.redeemedBy = recipient.id
      await queryRunner.manager.update(
        dbTransactionLink,
        { id: transactionLink.id },
        transactionLink,
      )
    }

    await queryRunner.commitTransaction()
  } catch (e) {
    await queryRunner.rollbackTransaction()
    throw new Error(`Transaction was not successful: ${e}`)
  } finally {
    await queryRunner.release()
  }

  // send notification email
  // TODO: translate
  await sendTransactionReceivedEmail({
    senderFirstName: sender.firstName,
    senderLastName: sender.lastName,
    recipientFirstName: recipient.firstName,
    recipientLastName: recipient.lastName,
    email: recipient.email,
    senderEmail: sender.email,
    amount,
    memo,
  })

  return true
}

@Resolver()
export class TransactionResolver {
  @Authorized([RIGHTS.TRANSACTION_LIST])
  @Query(() => TransactionList)
  async transactionList(
    @Args()
    { currentPage = 1, pageSize = 25, order = Order.DESC }: Paginated,
    @Ctx() context: any,
  ): Promise<TransactionList> {
    const now = new Date()
    const user = context.user

    // find current balance
    const lastTransaction = await dbTransaction.findOne(
      { userId: user.id },
      { order: { balanceDate: 'DESC' } },
    )

    const balanceResolver = new BalanceResolver()
    context.lastTransaction = lastTransaction

    if (!lastTransaction) {
      return new TransactionList(await balanceResolver.balance(context), [])
    }

    // find transactions
    // first page can contain 26 due to virtual decay transaction
    const offset = (currentPage - 1) * pageSize
    const transactionRepository = getCustomRepository(TransactionRepository)
    const [userTransactions, userTransactionsCount] = await transactionRepository.findByUserPaged(
      user.id,
      pageSize,
      offset,
      order,
    )
    context.transactionCount = userTransactionsCount

    // find involved users; I am involved
    const involvedUserIds: number[] = [user.id]
    userTransactions.forEach((transaction: dbTransaction) => {
      if (transaction.linkedUserId && !involvedUserIds.includes(transaction.linkedUserId)) {
        involvedUserIds.push(transaction.linkedUserId)
      }
    })
    // We need to show the name for deleted users for old transactions
    const involvedDbUsers = await dbUser
      .createQueryBuilder()
      .withDeleted()
      .where('id IN (:...userIds)', { userIds: involvedUserIds })
      .getMany()
    const involvedUsers = involvedDbUsers.map((u) => new User(u))

    const self = new User(user)
    const transactions: Transaction[] = []

    const transactionLinkRepository = getCustomRepository(TransactionLinkRepository)
    const { sumHoldAvailableAmount, sumAmount, lastDate, firstDate, transactionLinkcount } =
      await transactionLinkRepository.summary(user.id, now)
    context.linkCount = transactionLinkcount
    context.sumHoldAvailableAmount = sumHoldAvailableAmount

    // decay & link transactions
    if (currentPage === 1 && order === Order.DESC) {
      // The virtual decay is always on the booked amount, not including the generated, not yet booked links,
      // since the decay is substantially different when the amount is less
      transactions.push(
        virtualDecayTransaction(
          lastTransaction.balance,
          lastTransaction.balanceDate,
          now,
          self,
          sumHoldAvailableAmount,
        ),
      )
      // virtual transaction for pending transaction-links sum
      if (sumHoldAvailableAmount.greaterThan(0)) {
        transactions.push(
          virtualLinkTransaction(
            lastTransaction.balance.minus(sumHoldAvailableAmount.toString()),
            sumAmount.mul(-1),
            sumHoldAvailableAmount.mul(-1),
            sumHoldAvailableAmount.minus(sumAmount.toString()).mul(-1),
            firstDate || now,
            lastDate || now,
            self,
          ),
        )
      }
    }

    // transactions
    userTransactions.forEach((userTransaction) => {
      const linkedUser =
        userTransaction.typeId === TransactionTypeId.CREATION
          ? communityUser
          : involvedUsers.find((u) => u.id === userTransaction.linkedUserId)
      transactions.push(new Transaction(userTransaction, self, linkedUser))
    })

    // Construct Result
    return new TransactionList(await balanceResolver.balance(context), transactions)
  }

  @Authorized([RIGHTS.SEND_COINS])
  @Mutation(() => String)
  async sendCoins(
    @Args() { email, amount, memo }: TransactionSendArgs,
    @Ctx() context: any,
  ): Promise<boolean> {
    // TODO this is subject to replay attacks
    const senderUser = context.user
    if (senderUser.pubKey.length !== 32) {
      throw new Error('invalid sender public key')
    }

    // validate recipient user
    const recipientUser = await dbUser.findOne({ email: email }, { withDeleted: true })
    if (!recipientUser) {
      throw new Error('recipient not known')
    }
    if (recipientUser.deletedAt) {
      throw new Error('The recipient account was deleted')
    }
    if (!isHexPublicKey(recipientUser.pubKey.toString('hex'))) {
      throw new Error('invalid recipient public key')
    }

    await executeTransaction(amount, memo, senderUser, recipientUser)

    return true
  }
}
