import { Context, getUser } from '@/server/context'
import { Resolver, Query, Arg, Args, Authorized, Mutation, Ctx, Int } from 'type-graphql'
import {
  getCustomRepository,
  IsNull,
  Not,
  ObjectLiteral,
  getConnection,
  In,
  MoreThan,
  FindOperator,
} from '@dbTools/typeorm'
import { UserAdmin, SearchUsersResult } from '@model/UserAdmin'
import { PendingCreation } from '@model/PendingCreation'
import { CreatePendingCreations } from '@model/CreatePendingCreations'
import { UpdatePendingCreation } from '@model/UpdatePendingCreation'
import { RIGHTS } from '@/auth/RIGHTS'
import { UserRepository } from '@repository/User'
import CreatePendingCreationArgs from '@arg/CreatePendingCreationArgs'
import UpdatePendingCreationArgs from '@arg/UpdatePendingCreationArgs'
import SearchUsersArgs from '@arg/SearchUsersArgs'
import { Transaction as DbTransaction } from '@entity/Transaction'
import { Transaction } from '@model/Transaction'
import { TransactionLink, TransactionLinkResult } from '@model/TransactionLink'
import { TransactionLink as dbTransactionLink } from '@entity/TransactionLink'
import { TransactionRepository } from '@repository/Transaction'
import { calculateDecay } from '@/util/decay'
import { AdminPendingCreation } from '@entity/AdminPendingCreation'
import { hasElopageBuys } from '@/util/hasElopageBuys'
import { LoginEmailOptIn } from '@entity/LoginEmailOptIn'
import { User as dbUser } from '@entity/User'
import { User } from '@model/User'
import { TransactionTypeId } from '@enum/TransactionTypeId'
import Decimal from 'decimal.js-light'
import { Decay } from '@model/Decay'
import Paginated from '@arg/Paginated'
import TransactionLinkFilters from '@arg/TransactionLinkFilters'
import { Order } from '@enum/Order'
import { communityUser } from '@/util/communityUser'
import { checkOptInCode, activationLink, printTimeDuration } from './UserResolver'
import { sendAccountActivationEmail } from '@/mailer/sendAccountActivationEmail'
import CONFIG from '@/config'

// const EMAIL_OPT_IN_REGISTER = 1
// const EMAIL_OPT_UNKNOWN = 3 // elopage?
const MAX_CREATION_AMOUNT = new Decimal(1000)
const FULL_CREATION_AVAILABLE = [MAX_CREATION_AMOUNT, MAX_CREATION_AMOUNT, MAX_CREATION_AMOUNT]

@Resolver()
export class AdminResolver {
  @Authorized([RIGHTS.SEARCH_USERS])
  @Query(() => SearchUsersResult)
  async searchUsers(
    @Args()
    {
      searchText,
      currentPage = 1,
      pageSize = 25,
      filterByActivated = null,
      filterByDeleted = null,
    }: SearchUsersArgs,
  ): Promise<SearchUsersResult> {
    const userRepository = getCustomRepository(UserRepository)

    const filterCriteria: ObjectLiteral[] = []
    if (filterByActivated !== null) {
      filterCriteria.push({ emailChecked: filterByActivated })
    }

    if (filterByDeleted !== null) {
      filterCriteria.push({ deletedAt: filterByDeleted ? Not(IsNull()) : IsNull() })
    }

    const userFields = ['id', 'firstName', 'lastName', 'email', 'emailChecked', 'deletedAt']
    const [users, count] = await userRepository.findBySearchCriteriaPagedFiltered(
      userFields.map((fieldName) => {
        return 'user.' + fieldName
      }),
      searchText,
      filterCriteria,
      currentPage,
      pageSize,
    )

    if (users.length === 0) {
      return {
        userCount: 0,
        userList: [],
      }
    }

    const creations = await getUserCreations(users.map((u) => u.id))

    const adminUsers = await Promise.all(
      users.map(async (user) => {
        let emailConfirmationSend = ''
        if (!user.emailChecked) {
          const emailOptIn = await LoginEmailOptIn.findOne(
            {
              userId: user.id,
            },
            {
              order: {
                updatedAt: 'DESC',
                createdAt: 'DESC',
              },
              select: ['updatedAt', 'createdAt'],
            },
          )
          if (emailOptIn) {
            if (emailOptIn.updatedAt) {
              emailConfirmationSend = emailOptIn.updatedAt.toISOString()
            } else {
              emailConfirmationSend = emailOptIn.createdAt.toISOString()
            }
          }
        }
        const userCreations = creations.find((c) => c.id === user.id)
        const adminUser = new UserAdmin(
          user,
          userCreations ? userCreations.creations : FULL_CREATION_AVAILABLE,
          await hasElopageBuys(user.email),
          emailConfirmationSend,
        )
        return adminUser
      }),
    )
    return {
      userCount: count,
      userList: adminUsers,
    }
  }

  @Authorized([RIGHTS.DELETE_USER])
  @Mutation(() => Date, { nullable: true })
  async deleteUser(
    @Arg('userId', () => Int) userId: number,
    @Ctx() context: Context,
  ): Promise<Date | null> {
    const user = await dbUser.findOne({ id: userId })
    // user exists ?
    if (!user) {
      throw new Error(`Could not find user with userId: ${userId}`)
    }
    // moderator user disabled own account?
    const moderatorUser = getUser(context)
    if (moderatorUser.id === userId) {
      throw new Error('Moderator can not delete his own account!')
    }
    // soft-delete user
    await user.softRemove()
    const newUser = await dbUser.findOne({ id: userId }, { withDeleted: true })
    return newUser ? newUser.deletedAt : null
  }

  @Authorized([RIGHTS.UNDELETE_USER])
  @Mutation(() => Date, { nullable: true })
  async unDeleteUser(@Arg('userId', () => Int) userId: number): Promise<Date | null> {
    const user = await dbUser.findOne({ id: userId }, { withDeleted: true })
    // user exists ?
    if (!user) {
      throw new Error(`Could not find user with userId: ${userId}`)
    }
    // recover user account
    await user.recover()
    return null
  }

  @Authorized([RIGHTS.CREATE_PENDING_CREATION])
  @Mutation(() => [Number])
  async createPendingCreation(
    @Args() { email, amount, memo, creationDate, moderator }: CreatePendingCreationArgs,
  ): Promise<Decimal[]> {
    const user = await dbUser.findOne({ email }, { withDeleted: true })
    if (!user) {
      throw new Error(`Could not find user with email: ${email}`)
    }
    if (user.deletedAt) {
      throw new Error('This user was deleted. Cannot make a creation.')
    }
    if (!user.emailChecked) {
      throw new Error('Creation could not be saved, Email is not activated')
    }
    const creations = await getUserCreation(user.id)
    const creationDateObj = new Date(creationDate)
    if (isCreationValid(creations, amount, creationDateObj)) {
      const adminPendingCreation = AdminPendingCreation.create()
      adminPendingCreation.userId = user.id
      adminPendingCreation.amount = amount
      adminPendingCreation.created = new Date()
      adminPendingCreation.date = creationDateObj
      adminPendingCreation.memo = memo
      adminPendingCreation.moderator = moderator

      await AdminPendingCreation.save(adminPendingCreation)
    }
    return getUserCreation(user.id)
  }

  @Authorized([RIGHTS.CREATE_PENDING_CREATION])
  @Mutation(() => CreatePendingCreations)
  async createPendingCreations(
    @Arg('pendingCreations', () => [CreatePendingCreationArgs])
    pendingCreations: CreatePendingCreationArgs[],
  ): Promise<CreatePendingCreations> {
    let success = false
    const successfulCreation: string[] = []
    const failedCreation: string[] = []
    for (const pendingCreation of pendingCreations) {
      await this.createPendingCreation(pendingCreation)
        .then(() => {
          successfulCreation.push(pendingCreation.email)
          success = true
        })
        .catch(() => {
          failedCreation.push(pendingCreation.email)
        })
    }
    return {
      success,
      successfulCreation,
      failedCreation,
    }
  }

  @Authorized([RIGHTS.UPDATE_PENDING_CREATION])
  @Mutation(() => UpdatePendingCreation)
  async updatePendingCreation(
    @Args() { id, email, amount, memo, creationDate, moderator }: UpdatePendingCreationArgs,
  ): Promise<UpdatePendingCreation> {
    const user = await dbUser.findOne({ email }, { withDeleted: true })
    if (!user) {
      throw new Error(`Could not find user with email: ${email}`)
    }
    if (user.deletedAt) {
      throw new Error(`User was deleted (${email})`)
    }

    const pendingCreationToUpdate = await AdminPendingCreation.findOneOrFail({ id })

    if (pendingCreationToUpdate.userId !== user.id) {
      throw new Error('user of the pending creation and send user does not correspond')
    }

    const creationDateObj = new Date(creationDate)
    let creations = await getUserCreation(user.id)
    if (pendingCreationToUpdate.date.getMonth() === creationDateObj.getMonth()) {
      creations = updateCreations(creations, pendingCreationToUpdate)
    }

    if (!isCreationValid(creations, amount, creationDateObj)) {
      throw new Error('Creation is not valid')
    }
    pendingCreationToUpdate.amount = amount
    pendingCreationToUpdate.memo = memo
    pendingCreationToUpdate.date = new Date(creationDate)
    pendingCreationToUpdate.moderator = moderator

    await AdminPendingCreation.save(pendingCreationToUpdate)
    const result = new UpdatePendingCreation()
    result.amount = amount
    result.memo = pendingCreationToUpdate.memo
    result.date = pendingCreationToUpdate.date
    result.moderator = pendingCreationToUpdate.moderator

    result.creation = await getUserCreation(user.id)

    return result
  }

  @Authorized([RIGHTS.SEARCH_PENDING_CREATION])
  @Query(() => [PendingCreation])
  async getPendingCreations(): Promise<PendingCreation[]> {
    const pendingCreations = await AdminPendingCreation.find()
    if (pendingCreations.length === 0) {
      return []
    }

    const userIds = pendingCreations.map((p) => p.userId)
    const userCreations = await getUserCreations(userIds)
    const users = await dbUser.find({ where: { id: In(userIds) }, withDeleted: true })

    return pendingCreations.map((pendingCreation) => {
      const user = users.find((u) => u.id === pendingCreation.userId)
      const creation = userCreations.find((c) => c.id === pendingCreation.userId)

      return {
        ...pendingCreation,
        amount: pendingCreation.amount,
        firstName: user ? user.firstName : '',
        lastName: user ? user.lastName : '',
        email: user ? user.email : '',
        creation: creation ? creation.creations : FULL_CREATION_AVAILABLE,
      }
    })
  }

  @Authorized([RIGHTS.DELETE_PENDING_CREATION])
  @Mutation(() => Boolean)
  async deletePendingCreation(@Arg('id', () => Int) id: number): Promise<boolean> {
    const entity = await AdminPendingCreation.findOneOrFail(id)
    const res = await AdminPendingCreation.delete(entity)
    return !!res
  }

  @Authorized([RIGHTS.CONFIRM_PENDING_CREATION])
  @Mutation(() => Boolean)
  async confirmPendingCreation(
    @Arg('id', () => Int) id: number,
    @Ctx() context: Context,
  ): Promise<boolean> {
    const pendingCreation = await AdminPendingCreation.findOneOrFail(id)
    const moderatorUser = getUser(context)
    if (moderatorUser.id === pendingCreation.userId)
      throw new Error('Moderator can not confirm own pending creation')

    const user = await dbUser.findOneOrFail({ id: pendingCreation.userId }, { withDeleted: true })
    if (user.deletedAt) throw new Error('This user was deleted. Cannot confirm a creation.')

    const creations = await getUserCreation(pendingCreation.userId, false)
    if (!isCreationValid(creations, pendingCreation.amount, pendingCreation.date)) {
      throw new Error('Creation is not valid!!')
    }

    const receivedCallDate = new Date()

    const transactionRepository = getCustomRepository(TransactionRepository)
    const lastTransaction = await transactionRepository.findLastForUser(pendingCreation.userId)

    let newBalance = new Decimal(0)
    let decay: Decay | null = null
    if (lastTransaction) {
      decay = calculateDecay(lastTransaction.balance, lastTransaction.balanceDate, receivedCallDate)
      newBalance = decay.balance
    }
    newBalance = newBalance.add(pendingCreation.amount.toString())

    const transaction = new DbTransaction()
    transaction.typeId = TransactionTypeId.CREATION
    transaction.memo = pendingCreation.memo
    transaction.userId = pendingCreation.userId
    transaction.previous = lastTransaction ? lastTransaction.id : null
    // TODO pending creations decimal
    transaction.amount = new Decimal(Number(pendingCreation.amount))
    transaction.creationDate = pendingCreation.date
    transaction.balance = newBalance
    transaction.balanceDate = receivedCallDate
    transaction.decay = decay ? decay.decay : new Decimal(0)
    transaction.decayStart = decay ? decay.start : null
    await transaction.save()

    await AdminPendingCreation.delete(pendingCreation)

    return true
  }

  @Authorized([RIGHTS.CREATION_TRANSACTION_LIST])
  @Query(() => [Transaction])
  async creationTransactionList(
    @Args()
    { currentPage = 1, pageSize = 25, order = Order.DESC }: Paginated,
    @Arg('userId', () => Int) userId: number,
  ): Promise<Transaction[]> {
    const offset = (currentPage - 1) * pageSize
    const transactionRepository = getCustomRepository(TransactionRepository)
    const [userTransactions] = await transactionRepository.findByUserPaged(
      userId,
      pageSize,
      offset,
      order,
      true,
    )

    const user = await dbUser.findOneOrFail({ id: userId })
    return userTransactions.map((t) => new Transaction(t, new User(user), communityUser))
  }

  @Authorized([RIGHTS.SEND_ACTIVATION_EMAIL])
  @Mutation(() => Boolean)
  async sendActivationEmail(@Arg('email') email: string): Promise<boolean> {
    email = email.trim().toLowerCase()
    const user = await dbUser.findOneOrFail({ email: email })

    // can be both types: REGISTER and RESET_PASSWORD
    let optInCode = await LoginEmailOptIn.findOne({
      where: { userId: user.id },
      order: { updatedAt: 'DESC' },
    })

    optInCode = await checkOptInCode(optInCode, user.id)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const emailSent = await sendAccountActivationEmail({
      link: activationLink(optInCode),
      firstName: user.firstName,
      lastName: user.lastName,
      email,
      duration: printTimeDuration(CONFIG.EMAIL_CODE_VALID_TIME),
    })

    /*  uncomment this, when you need the activation link on the console
    // In case EMails are disabled log the activation link for the user
    if (!emailSent) {
    // eslint-disable-next-line no-console
    console.log(`Account confirmation link: ${activationLink}`)
    }
    */

    return true
  }

  @Authorized([RIGHTS.LIST_TRANSACTION_LINKS_ADMIN])
  @Query(() => TransactionLinkResult)
  async listTransactionLinksAdmin(
    @Args()
    { currentPage = 1, pageSize = 5, order = Order.DESC }: Paginated,
    @Args()
    filters: TransactionLinkFilters,
    @Arg('userId', () => Int) userId: number,
  ): Promise<TransactionLinkResult> {
    const user = await dbUser.findOneOrFail({ id: userId })
    const where: {
      userId: number
      redeemedBy?: number | null
      validUntil?: FindOperator<Date> | null
    } = {
      userId,
    }
    if (!filters.withRedeemed) where.redeemedBy = null
    if (!filters.withExpired) where.validUntil = MoreThan(new Date())
    const [transactionLinks, count] = await dbTransactionLink.findAndCount({
      where,
      withDeleted: filters.withDeleted,
      order: {
        createdAt: order,
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    })

    return {
      linkCount: count,
      linkList: transactionLinks.map((tl) => new TransactionLink(tl, new User(user))),
    }
  }
}

interface CreationMap {
  id: number
  creations: Decimal[]
}

async function getUserCreation(id: number, includePending = true): Promise<Decimal[]> {
  const creations = await getUserCreations([id], includePending)
  return creations[0] ? creations[0].creations : FULL_CREATION_AVAILABLE
}

async function getUserCreations(ids: number[], includePending = true): Promise<CreationMap[]> {
  const months = getCreationMonths()

  const queryRunner = getConnection().createQueryRunner()
  await queryRunner.connect()

  const dateFilter = 'last_day(curdate() - interval 3 month) + interval 1 day'

  const unionString = includePending
    ? `
    UNION
      SELECT date AS date, amount AS amount, userId AS userId FROM admin_pending_creations
        WHERE userId IN (${ids.toString()})
        AND date >= ${dateFilter}`
    : ''

  const unionQuery = await queryRunner.manager.query(`
    SELECT MONTH(date) AS month, sum(amount) AS sum, userId AS id FROM
      (SELECT creation_date AS date, amount AS amount, user_id AS userId FROM transactions
        WHERE user_id IN (${ids.toString()})
        AND type_id = ${TransactionTypeId.CREATION}
        AND creation_date >= ${dateFilter}
      ${unionString}) AS result
    GROUP BY month, userId
    ORDER BY date DESC
  `)

  await queryRunner.release()

  return ids.map((id) => {
    return {
      id,
      creations: months.map((month) => {
        const creation = unionQuery.find(
          (raw: { month: string; id: string; creation: number[] }) =>
            parseInt(raw.month) === month && parseInt(raw.id) === id,
        )
        return MAX_CREATION_AMOUNT.minus(creation ? creation.sum : 0)
      }),
    }
  })
}

function updateCreations(creations: Decimal[], pendingCreation: AdminPendingCreation): Decimal[] {
  const index = getCreationIndex(pendingCreation.date.getMonth())

  if (index < 0) {
    throw new Error('You cannot create GDD for a month older than the last three months.')
  }
  creations[index] = creations[index].plus(pendingCreation.amount)
  return creations
}

function isCreationValid(creations: Decimal[], amount: Decimal, creationDate: Date) {
  const index = getCreationIndex(creationDate.getMonth())

  if (index < 0) {
    throw new Error(`No Creation found!`)
  }

  if (amount.greaterThan(creations[index].toString())) {
    throw new Error(
      `The amount (${amount} GDD) to be created exceeds the available amount (${creations[index]} GDD) for this month.`,
    )
  }

  return true
}

const getCreationMonths = (): number[] => {
  const now = new Date(Date.now())
  return [
    now.getMonth() + 1,
    new Date(now.getFullYear(), now.getMonth() - 1, 1).getMonth() + 1,
    new Date(now.getFullYear(), now.getMonth() - 2, 1).getMonth() + 1,
  ].reverse()
}

const getCreationIndex = (month: number): number => {
  return getCreationMonths().findIndex((el) => el === month + 1)
}
