import { EventProtocol } from '@entity/EventProtocol'
import decimal from 'decimal.js-light'
import { EventProtocolType } from './EventProtocolType'

export class EventBasic {
  type: string
  createdAt: Date
}
export class EventBasicUserId extends EventBasic {
  userId: number
}

export class EventBasicTx extends EventBasicUserId {
  xUserId: number
  xCommunityId: number
  transactionId: number
  amount: decimal
}

export class EventBasicCt extends EventBasicUserId {
  contributionId: number
  amount: decimal
}

export class EventBasicCtX extends EventBasicUserId {
  xUserId: number
  xCommunityId: number
  contributionId: number
  amount: decimal
}

export class EventBasicRedeem extends EventBasicUserId {
  transactionId?: number
  contributionId?: number
}

export class EventBasicCtMsg extends EventBasicCt {
  message: string
}

export class EventVisitGradido extends EventBasic {}
export class EventRegister extends EventBasicUserId {}
export class EventRedeemRegister extends EventBasicRedeem {}
export class EventVerifyRedeem extends EventBasicRedeem {}
export class EventInactiveAccount extends EventBasicUserId {}
export class EventSendConfirmationEmail extends EventBasicUserId {}
export class EventSendAccountMultiRegistrationEmail extends EventBasicUserId {}
export class EventSendForgotPasswordEmail extends EventBasicUserId {}
export class EventSendTransactionSendEmail extends EventBasicTx {}
export class EventSendTransactionReceiveEmail extends EventBasicTx {}
export class EventSendTransactionLinkRedeemEmail extends EventBasicTx {}
export class EventSendAddedContributionEmail extends EventBasicCt {}
export class EventSendContributionConfirmEmail extends EventBasicCt {}
export class EventConfirmationEmail extends EventBasicUserId {}
export class EventRegisterEmailKlicktipp extends EventBasicUserId {}
export class EventLogin extends EventBasicUserId {}
export class EventLogout extends EventBasicUserId {}
export class EventRedeemLogin extends EventBasicRedeem {}
export class EventActivateAccount extends EventBasicUserId {}
export class EventPasswordChange extends EventBasicUserId {}
export class EventTransactionSend extends EventBasicTx {}
export class EventTransactionSendRedeem extends EventBasicTx {}
export class EventTransactionRepeateRedeem extends EventBasicTx {}
export class EventTransactionCreation extends EventBasicUserId {
  transactionId: number
  amount: decimal
}
export class EventTransactionReceive extends EventBasicTx {}
export class EventTransactionReceiveRedeem extends EventBasicTx {}
export class EventContributionCreate extends EventBasicCt {}
export class EventUserCreateContributionMessage extends EventBasicCtMsg {}
export class EventAdminCreateContributionMessage extends EventBasicCtMsg {
  message: string
}
export class EventContributionDelete extends EventBasicCt {}
export class EventContributionUpdate extends EventBasicCt {}
export class EventContributionConfirm extends EventBasicCt {
  xUserId: number
  xCommunityId: number
}
export class EventContributionDeny extends EventBasicCtX {}
export class EventContributionLinkDefine extends EventBasicCt {}
export class EventContributionLinkActivateRedeem extends EventBasicCt {}

export class Event {
  constructor()
  constructor(event?: EventProtocol) {
    if (event) {
      this.id = event.id
      this.type = event.type
      this.createdAt = event.createdAt
      this.userId = event.userId
      this.xUserId = event.xUserId
      this.xCommunityId = event.xCommunityId
      this.transactionId = event.transactionId
      this.contributionId = event.contributionId
      this.amount = event.amount
    }
  }

  public setEventBasic(): Event {
    this.type = EventProtocolType.BASIC
    this.createdAt = new Date()

    return this
  }

  public setEventVisitGradido(): Event {
    this.setEventBasic()
    this.type = EventProtocolType.VISIT_GRADIDO

    return this
  }

  public setEventRegister(ev: EventRegister): Event {
    this.setByBasicUser(ev.userId)
    this.type = EventProtocolType.REGISTER

    return this
  }

  public setEventRedeemRegister(ev: EventRedeemRegister): Event {
    this.setByBasicRedeem(ev.userId, ev.transactionId, ev.contributionId)
    this.type = EventProtocolType.REDEEM_REGISTER

    return this
  }

  public setEventVerifyRedeem(ev: EventVerifyRedeem): Event {
    this.setByBasicRedeem(ev.userId, ev.transactionId, ev.contributionId)
    this.type = EventProtocolType.VERIFY_REDEEM

    return this
  }

  public setEventInactiveAccount(ev: EventInactiveAccount): Event {
    this.setByBasicUser(ev.userId)
    this.type = EventProtocolType.INACTIVE_ACCOUNT

    return this
  }

  public setEventSendConfirmationEmail(ev: EventSendConfirmationEmail): Event {
    this.setByBasicUser(ev.userId)
    this.type = EventProtocolType.SEND_CONFIRMATION_EMAIL

    return this
  }

  public setEventSendAccountMultiRegistrationEmail(
    ev: EventSendAccountMultiRegistrationEmail,
  ): Event {
    this.setByBasicUser(ev.userId)
    this.type = EventProtocolType.SEND_ACCOUNT_MULTIREGISTRATION_EMAIL

    return this
  }

  public setEventSendForgotPasswordEmail(ev: EventSendForgotPasswordEmail): Event {
    this.setByBasicUser(ev.userId)
    this.type = EventProtocolType.SEND_FORGOT_PASSWORD_EMAIL

    return this
  }

  public setEventSendTransactionSendEmail(ev: EventSendTransactionSendEmail): Event {
    this.setByBasicUser(ev.userId)
    if (ev.transactionId) this.transactionId = ev.transactionId
    if (ev.xCommunityId) this.xCommunityId = ev.xCommunityId
    if (ev.xUserId) this.xUserId = ev.xUserId
    if (ev.amount) this.amount = ev.amount
    this.type = EventProtocolType.SEND_TRANSACTION_SEND_EMAIL

    return this
  }

  public setEventSendTransactionReceiveEmail(ev: EventSendTransactionReceiveEmail): Event {
    this.setByBasicUser(ev.userId)
    if (ev.transactionId) this.transactionId = ev.transactionId
    if (ev.xCommunityId) this.xCommunityId = ev.xCommunityId
    if (ev.xUserId) this.xUserId = ev.xUserId
    if (ev.amount) this.amount = ev.amount
    this.type = EventProtocolType.SEND_TRANSACTION_RECEIVE_EMAIL

    return this
  }

  public setEventSendTransactionLinkRedeemEmail(ev: EventSendTransactionLinkRedeemEmail): Event {
    this.setByBasicUser(ev.userId)
    if (ev.transactionId) this.transactionId = ev.transactionId
    if (ev.xCommunityId) this.xCommunityId = ev.xCommunityId
    if (ev.xUserId) this.xUserId = ev.xUserId
    if (ev.amount) this.amount = ev.amount
    this.type = EventProtocolType.SEND_TRANSACTION_LINK_REDEEM_EMAIL

    return this
  }

  public setEventSendAddedContributionEmail(ev: EventSendAddedContributionEmail): Event {
    this.setByBasicUser(ev.userId)
    if (ev.contributionId) this.contributionId = ev.contributionId
    this.type = EventProtocolType.SEND_ADDED_CONTRIBUTION_EMAIL

    return this
  }

  public setEventSendContributionConfirmEmail(ev: EventSendContributionConfirmEmail): Event {
    this.setByBasicUser(ev.userId)
    if (ev.contributionId) this.contributionId = ev.contributionId
    this.type = EventProtocolType.SEND_CONTRIBUTION_CONFIRM_EMAIL
    return this
  }

  public setEventConfirmationEmail(ev: EventConfirmationEmail): Event {
    this.setByBasicUser(ev.userId)
    this.type = EventProtocolType.CONFIRM_EMAIL

    return this
  }

  public setEventRegisterEmailKlicktipp(ev: EventRegisterEmailKlicktipp): Event {
    this.setByBasicUser(ev.userId)
    this.type = EventProtocolType.REGISTER_EMAIL_KLICKTIPP

    return this
  }

  public setEventLogin(ev: EventLogin): Event {
    this.setByBasicUser(ev.userId)
    this.type = EventProtocolType.LOGIN

    return this
  }

  public setEventLogout(ev: EventLogout): Event {
    this.setByBasicUser(ev.userId)
    this.type = EventProtocolType.LOGOUT

    return this
  }

  public setEventRedeemLogin(ev: EventRedeemLogin): Event {
    this.setByBasicRedeem(ev.userId, ev.transactionId, ev.contributionId)
    this.type = EventProtocolType.REDEEM_LOGIN

    return this
  }

  public setEventActivateAccount(ev: EventActivateAccount): Event {
    this.setByBasicUser(ev.userId)
    this.type = EventProtocolType.ACTIVATE_ACCOUNT

    return this
  }

  public setEventPasswordChange(ev: EventPasswordChange): Event {
    this.setByBasicUser(ev.userId)
    this.type = EventProtocolType.PASSWORD_CHANGE

    return this
  }

  public setEventTransactionSend(ev: EventTransactionSend): Event {
    this.setByBasicTx(ev.userId, ev.xUserId, ev.xCommunityId, ev.transactionId, ev.amount)
    this.type = EventProtocolType.TRANSACTION_SEND

    return this
  }

  public setEventTransactionSendRedeem(ev: EventTransactionSendRedeem): Event {
    this.setByBasicTx(ev.userId, ev.xUserId, ev.xCommunityId, ev.transactionId, ev.amount)
    this.type = EventProtocolType.TRANSACTION_SEND_REDEEM

    return this
  }

  public setEventTransactionRepeateRedeem(ev: EventTransactionRepeateRedeem): Event {
    this.setByBasicTx(ev.userId, ev.xUserId, ev.xCommunityId, ev.transactionId, ev.amount)
    this.type = EventProtocolType.TRANSACTION_REPEATE_REDEEM

    return this
  }

  public setEventTransactionCreation(ev: EventTransactionCreation): Event {
    this.setByBasicUser(ev.userId)
    if (ev.transactionId) this.transactionId = ev.transactionId
    if (ev.amount) this.amount = ev.amount
    this.type = EventProtocolType.TRANSACTION_CREATION

    return this
  }

  public setEventTransactionReceive(ev: EventTransactionReceive): Event {
    this.setByBasicTx(ev.userId, ev.xUserId, ev.xCommunityId, ev.transactionId, ev.amount)
    this.type = EventProtocolType.TRANSACTION_RECEIVE

    return this
  }

  public setEventTransactionReceiveRedeem(ev: EventTransactionReceiveRedeem): Event {
    this.setByBasicTx(ev.userId, ev.xUserId, ev.xCommunityId, ev.transactionId, ev.amount)
    this.type = EventProtocolType.TRANSACTION_RECEIVE_REDEEM

    return this
  }

  public setEventContributionCreate(ev: EventContributionCreate): Event {
    this.setByBasicCt(ev.userId, ev.contributionId, ev.amount)
    this.type = EventProtocolType.CONTRIBUTION_CREATE

    return this
  }

  public setEventUserCreateContributionMessage(ev: EventUserCreateContributionMessage): Event {
    this.setByBasicCt(ev.userId, ev.contributionId, ev.amount)
    this.type = EventProtocolType.USER_CREATE_CONTRIBUTION_MESSAGE
    this.message = ev.message
    return this
  }

  public setEventAdminCreateContributionMessage(ev: EventAdminCreateContributionMessage): Event {
    this.setByBasicCt(ev.userId, ev.contributionId, ev.amount)
    this.type = EventProtocolType.ADMIN_CREATE_CONTRIBUTION_MESSAGE
    this.message = ev.message
    return this
  }

  public setEventContributionDelete(ev: EventContributionDelete): Event {
    this.setByBasicCt(ev.userId, ev.contributionId, ev.amount)
    this.type = EventProtocolType.CONTRIBUTION_DELETE

    return this
  }

  public setEventContributionUpdate(ev: EventContributionUpdate): Event {
    this.setByBasicCt(ev.userId, ev.contributionId, ev.amount)
    this.type = EventProtocolType.CONTRIBUTION_UPDATE

    return this
  }

  public setEventContributionConfirm(ev: EventContributionConfirm): Event {
    this.setByBasicCt(ev.userId, ev.contributionId, ev.amount)
    if (ev.xUserId) this.xUserId = ev.xUserId
    if (ev.xCommunityId) this.xCommunityId = ev.xCommunityId
    this.type = EventProtocolType.CONTRIBUTION_CONFIRM

    return this
  }

  public setEventContributionDeny(ev: EventContributionDeny): Event {
    this.setByBasicTx(ev.userId)
    if (ev.contributionId) this.contributionId = ev.contributionId
    if (ev.xCommunityId) this.xCommunityId = ev.xCommunityId
    if (ev.xUserId) this.xUserId = ev.xUserId
    if (ev.amount) this.amount = ev.amount
    this.type = EventProtocolType.CONTRIBUTION_DENY

    return this
  }

  public setEventContributionLinkDefine(ev: EventContributionLinkDefine): Event {
    this.setByBasicCt(ev.userId, ev.contributionId, ev.amount)
    this.type = EventProtocolType.CONTRIBUTION_LINK_DEFINE

    return this
  }

  public setEventContributionLinkActivateRedeem(ev: EventContributionLinkActivateRedeem): Event {
    this.setByBasicCt(ev.userId, ev.contributionId, ev.amount)
    this.type = EventProtocolType.CONTRIBUTION_LINK_ACTIVATE_REDEEM

    return this
  }

  setByBasicUser(userId: number): Event {
    this.setEventBasic()
    this.userId = userId

    return this
  }

  setByBasicTx(
    userId: number,
    xUserId?: number,
    xCommunityId?: number,
    transactionId?: number,
    amount?: decimal,
  ): Event {
    this.setByBasicUser(userId)
    if (xUserId) this.xUserId = xUserId
    if (xCommunityId) this.xCommunityId = xCommunityId
    if (transactionId) this.transactionId = transactionId
    if (amount) this.amount = amount

    return this
  }

  setByBasicCt(userId: number, contributionId: number, amount?: decimal): Event {
    this.setByBasicUser(userId)
    if (contributionId) this.contributionId = contributionId
    if (amount) this.amount = amount

    return this
  }

  setByBasicRedeem(userId: number, transactionId?: number, contributionId?: number): Event {
    this.setByBasicUser(userId)
    if (transactionId) this.transactionId = transactionId
    if (contributionId) this.contributionId = contributionId

    return this
  }

  setByEventTransactionCreation(event: EventTransactionCreation): Event {
    this.type = event.type
    this.createdAt = event.createdAt
    this.userId = event.userId
    this.transactionId = event.transactionId
    this.amount = event.amount

    return this
  }

  setByEventContributionConfirm(event: EventContributionConfirm): Event {
    this.type = event.type
    this.createdAt = event.createdAt
    this.userId = event.userId
    this.xUserId = event.xUserId
    this.xCommunityId = event.xCommunityId
    this.amount = event.amount

    return this
  }

  id: number
  type: string
  createdAt: Date
  userId: number
  xUserId?: number
  xCommunityId?: number
  transactionId?: number
  contributionId?: number
  amount?: decimal
  message?: string
}
