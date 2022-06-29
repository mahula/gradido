import { EventEmitter } from 'events'
import { backendLogger as logger } from '@/server/logger'
import { EventProtocolType } from './EventProtocolType'
import { EventProtocol } from '@entity/EventProtocol'
import Decimal from 'decimal.js-light'

class EventProtocolEmitter extends EventEmitter {}
export const eventProtocol = new EventProtocolEmitter()

eventProtocol.on('error', (err) => {
  logger.error(`ERROR in EventProtocol: ${err}`)
})

eventProtocol.on(EventProtocolType.BASIC, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.BASIC}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(EventProtocolType.BASIC, createdAt, userId, null, null, null, null, null)
})

eventProtocol.on(EventProtocolType.VISIT_GRADIDO, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.VISIT_GRADIDO}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(EventProtocolType.VISIT_GRADIDO, createdAt, userId, null, null, null, null, null)
})

eventProtocol.on(EventProtocolType.REGISTER, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.REGISTER}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(EventProtocolType.REGISTER, createdAt, userId, null, null, null, null, null)
})

eventProtocol.on(
  EventProtocolType.REDEEM_REGISTER,
  (createdAt: Date, userId: number, transactionId: number, contributionId: number) => {
    logger.info(
      `EventProtocol - ${EventProtocolType.REDEEM_REGISTER}: createdAt=${createdAt}, userId=${userId}, transactionId=${transactionId}, contributionId=${contributionId}`,
    )
    writeEvent(
      EventProtocolType.REDEEM_REGISTER,
      createdAt,
      userId,
      null,
      null,
      transactionId,
      contributionId,
      null,
    )
  },
)

eventProtocol.on(EventProtocolType.INACTIVE_ACCOUNT, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.INACTIVE_ACCOUNT}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(EventProtocolType.INACTIVE_ACCOUNT, createdAt, userId, null, null, null, null, null)
})

eventProtocol.on(EventProtocolType.SEND_CONFIRMATION_EMAIL, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.SEND_CONFIRMATION_EMAIL}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(
    EventProtocolType.SEND_CONFIRMATION_EMAIL,
    createdAt,
    userId,
    null,
    null,
    null,
    null,
    null,
  )
})

eventProtocol.on(EventProtocolType.CONFIRM_EMAIL, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.CONFIRM_EMAIL}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(EventProtocolType.CONFIRM_EMAIL, createdAt, userId, null, null, null, null, null)
})

eventProtocol.on(EventProtocolType.REGISTER_EMAIL_KLICKTIPP, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.REGISTER_EMAIL_KLICKTIPP}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(
    EventProtocolType.REGISTER_EMAIL_KLICKTIPP,
    createdAt,
    userId,
    null,
    null,
    null,
    null,
    null,
  )
})

eventProtocol.on(EventProtocolType.LOGIN, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.LOGIN}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(EventProtocolType.LOGIN, createdAt, userId, null, null, null, null, null)
})

eventProtocol.on(
  EventProtocolType.REDEEM_LOGIN,
  (createdAt: Date, userId: number, transactionId: number, contributionId: number) => {
    logger.info(
      `EventProtocol - ${EventProtocolType.REDEEM_LOGIN}: createdAt=${createdAt}, userId=${userId}, transactionId=${transactionId}, contributionId=${contributionId}`,
    )
    writeEvent(
      EventProtocolType.REDEEM_LOGIN,
      createdAt,
      userId,
      null,
      null,
      transactionId,
      contributionId,
      null,
    )
  },
)

eventProtocol.on(EventProtocolType.ACTIVATE_ACCOUNT, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.ACTIVATE_ACCOUNT}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(EventProtocolType.ACTIVATE_ACCOUNT, createdAt, userId, null, null, null, null, null)
})

eventProtocol.on(EventProtocolType.PASSWORD_CHANGE, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.PASSWORD_CHANGE}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(EventProtocolType.PASSWORD_CHANGE, createdAt, userId, null, null, null, null, null)
})

eventProtocol.on(EventProtocolType.TRANSACTION_SEND, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.TRANSACTION_SEND}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(EventProtocolType.TRANSACTION_SEND, createdAt, userId, null, null, null, null, null)
})

eventProtocol.on(EventProtocolType.TRANSACTION_SEND_REDEEM, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.TRANSACTION_SEND_REDEEM}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(
    EventProtocolType.TRANSACTION_SEND_REDEEM,
    createdAt,
    userId,
    null,
    null,
    null,
    null,
    null,
  )
})

eventProtocol.on(
  EventProtocolType.TRANSACTION_REPEATE_REDEEM,
  (createdAt: Date, userId: number) => {
    logger.info(
      `EventProtocol - ${EventProtocolType.TRANSACTION_REPEATE_REDEEM}: createdAt=${createdAt}, userId=${userId}`,
    )
    writeEvent(
      EventProtocolType.TRANSACTION_REPEATE_REDEEM,
      createdAt,
      userId,
      null,
      null,
      null,
      null,
      null,
    )
  },
)

eventProtocol.on(EventProtocolType.TRANSACTION_CREATION, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.TRANSACTION_CREATION}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(
    EventProtocolType.TRANSACTION_CREATION,
    createdAt,
    userId,
    null,
    null,
    null,
    null,
    null,
  )
})

eventProtocol.on(EventProtocolType.TRANSACTION_RECEIVE, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.TRANSACTION_RECEIVE}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(EventProtocolType.TRANSACTION_RECEIVE, createdAt, userId, null, null, null, null, null)
})

eventProtocol.on(
  EventProtocolType.TRANSACTION_RECEIVE_REDEEM,
  (createdAt: Date, userId: number) => {
    logger.info(
      `EventProtocol - ${EventProtocolType.TRANSACTION_RECEIVE_REDEEM}: createdAt=${createdAt}, userId=${userId}`,
    )
    writeEvent(
      EventProtocolType.TRANSACTION_RECEIVE_REDEEM,
      createdAt,
      userId,
      null,
      null,
      null,
      null,
      null,
    )
  },
)

eventProtocol.on(
  EventProtocolType.CONTRIBUTION_CREATE,
  (createdAt: Date, userId: number, contributionId: number) => {
    logger.info(
      `EventProtocol - ${EventProtocolType.CONTRIBUTION_CREATE}: createdAt=${createdAt}, userId=${userId}, contributionId=${contributionId}`,
    )
    writeEvent(
      EventProtocolType.CONTRIBUTION_CREATE,
      createdAt,
      userId,
      null,
      null,
      null,
      contributionId,
      null,
    )
  },
)

eventProtocol.on(
  EventProtocolType.CONTRIBUTION_CONFIRM,
  (
    createdAt: Date,
    userId: number,
    xUserId: number,
    xCommunityId: number,
    contributionId: number,
  ) => {
    logger.info(
      `EventProtocol - ${EventProtocolType.CONTRIBUTION_CONFIRM}: createdAt=${createdAt}, userId=${userId}, xUserId=${xUserId}, xCommunityId=${xCommunityId}, contributionId=${contributionId}`,
    )
    writeEvent(
      EventProtocolType.CONTRIBUTION_CONFIRM,
      createdAt,
      userId,
      xUserId,
      xCommunityId,
      null,
      contributionId,
      null,
    )
  },
)

eventProtocol.on(EventProtocolType.CONTRIBUTION_LINK_DEFINE, (createdAt: Date, userId: number) => {
  logger.info(
    `EventProtocol - ${EventProtocolType.CONTRIBUTION_LINK_DEFINE}: createdAt=${createdAt}, userId=${userId}`,
  )
  writeEvent(
    EventProtocolType.CONTRIBUTION_LINK_DEFINE,
    createdAt,
    userId,
    null,
    null,
    null,
    null,
    null,
  )
})

eventProtocol.on(
  EventProtocolType.CONTRIBUTION_LINK_ACTIVATE_REDEEM,
  (createdAt: Date, userId: number) => {
    logger.info(
      `EventProtocol - ${EventProtocolType.CONTRIBUTION_LINK_ACTIVATE_REDEEM}: createdAt=${createdAt}, userId=${userId}`,
    )
    writeEvent(
      EventProtocolType.CONTRIBUTION_LINK_ACTIVATE_REDEEM,
      createdAt,
      userId,
      null,
      null,
      null,
      null,
      null,
    )
  },
)

async function writeEvent(
  type: string,
  createdAt: Date,
  userId: number,
  xUserId: number | null,
  xCommunityId: number | null,
  transactionId: number | null,
  contributionId: number | null,
  amount: Decimal | null,
) {
  const event = new EventProtocol()
  event.type = type
  event.createdAt = createdAt
  event.userId = userId
  // eslint-disable-next-line no-unused-expressions
  xUserId ? (event.xUserId = xUserId) : null
  // eslint-disable-next-line no-unused-expressions
  xCommunityId ? (event.xCommunityId = xCommunityId) : null
  // eslint-disable-next-line no-unused-expressions
  contributionId ? (event.contributionId = contributionId) : null
  // eslint-disable-next-line no-unused-expressions
  transactionId ? (event.transactionId = transactionId) : null
  // eslint-disable-next-line no-unused-expressions
  amount ? (event.amount = amount) : null
  // set event values here when having the result ...
  await event.save()
}
