export { EVENT_SEND_ACCOUNT_MULTIREGISTRATION_EMAIL } from './EVENT_SEND_ACCOUNT_MULTIREGISTRATION_EMAIL'
export { EVENT_SEND_CONFIRMATION_EMAIL } from './EVENT_SEND_CONFIRMATION_EMAIL'
export { EVENT_TRANSACTION_SEND } from './EVENT_TRANSACTION_SEND'
export { EVENT_TRANSACTION_RECEIVE } from './EVENT_TRANSACTION_RECEIVE'

export enum EventType {
  ACTIVATE_ACCOUNT = 'ACTIVATE_ACCOUNT',
  // TODO CONTRIBUTION_CONFIRM = 'CONTRIBUTION_CONFIRM',
  ADMIN_CONTRIBUTION_CONFIRM = 'ADMIN_CONTRIBUTION_CONFIRM',
  ADMIN_CONTRIBUTION_CREATE = 'ADMIN_CONTRIBUTION_CREATE',
  ADMIN_CONTRIBUTION_DELETE = 'ADMIN_CONTRIBUTION_DELETE',
  ADMIN_CONTRIBUTION_DENY = 'ADMIN_CONTRIBUTION_DENY',
  ADMIN_CONTRIBUTION_UPDATE = 'ADMIN_CONTRIBUTION_UPDATE',
  ADMIN_CONTRIBUTION_LINK_CREATE = 'ADMIN_CONTRIBUTION_LINK_CREATE',
  ADMIN_CONTRIBUTION_LINK_DELETE = 'ADMIN_CONTRIBUTION_LINK_DELETE',
  ADMIN_CONTRIBUTION_LINK_UPDATE = 'ADMIN_CONTRIBUTION_LINK_UPDATE',
  ADMIN_SEND_CONFIRMATION_EMAIL = 'ADMIN_SEND_CONFIRMATION_EMAIL',
  CONTRIBUTION_CREATE = 'CONTRIBUTION_CREATE',
  CONTRIBUTION_DELETE = 'CONTRIBUTION_DELETE',
  CONTRIBUTION_UPDATE = 'CONTRIBUTION_UPDATE',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  REDEEM_REGISTER = 'REDEEM_REGISTER',
  SEND_ACCOUNT_MULTIREGISTRATION_EMAIL = 'SEND_ACCOUNT_MULTIREGISTRATION_EMAIL',
  SEND_CONFIRMATION_EMAIL = 'SEND_CONFIRMATION_EMAIL',
  TRANSACTION_SEND = 'TRANSACTION_SEND',
  TRANSACTION_RECEIVE = 'TRANSACTION_RECEIVE',
  // VISIT_GRADIDO = 'VISIT_GRADIDO',
  // VERIFY_REDEEM = 'VERIFY_REDEEM',
  // INACTIVE_ACCOUNT = 'INACTIVE_ACCOUNT',
  // CONFIRM_EMAIL = 'CONFIRM_EMAIL',
  // REGISTER_EMAIL_KLICKTIPP = 'REGISTER_EMAIL_KLICKTIPP',
  // LOGOUT = 'LOGOUT',
  // REDEEM_LOGIN = 'REDEEM_LOGIN',
  // SEND_FORGOT_PASSWORD_EMAIL = 'SEND_FORGOT_PASSWORD_EMAIL',
  // PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  // SEND_TRANSACTION_SEND_EMAIL = 'SEND_TRANSACTION_SEND_EMAIL',
  // SEND_TRANSACTION_RECEIVE_EMAIL = 'SEND_TRANSACTION_RECEIVE_EMAIL',
  // TRANSACTION_SEND_REDEEM = 'TRANSACTION_SEND_REDEEM',
  // TRANSACTION_REPEATE_REDEEM = 'TRANSACTION_REPEATE_REDEEM',
  // TRANSACTION_CREATION = 'TRANSACTION_CREATION',
  // TRANSACTION_RECEIVE_REDEEM = 'TRANSACTION_RECEIVE_REDEEM',
  // SEND_TRANSACTION_LINK_REDEEM_EMAIL = 'SEND_TRANSACTION_LINK_REDEEM_EMAIL',
  // SEND_ADDED_CONTRIBUTION_EMAIL = 'SEND_ADDED_CONTRIBUTION_EMAIL',
  // SEND_CONTRIBUTION_CONFIRM_EMAIL = 'SEND_CONTRIBUTION_CONFIRM_EMAIL',
  // CONTRIBUTION_LINK_ACTIVATE_REDEEM = 'CONTRIBUTION_LINK_ACTIVATE_REDEEM',
  // USER_CREATE_CONTRIBUTION_MESSAGE = 'USER_CREATE_CONTRIBUTION_MESSAGE',
  // ADMIN_CREATE_CONTRIBUTION_MESSAGE = 'ADMIN_CREATE_CONTRIBUTION_MESSAGE',
  // DELETE_USER = 'DELETE_USER',
  // UNDELETE_USER = 'UNDELETE_USER',
  // CHANGE_USER_ROLE = 'CHANGE_USER_ROLE',
  // ADMIN_UPDATE_CONTRIBUTION = 'ADMIN_UPDATE_CONTRIBUTION',
  // ADMIN_DELETE_CONTRIBUTION = 'ADMIN_DELETE_CONTRIBUTION',
  // CREATE_CONTRIBUTION_LINK = 'CREATE_CONTRIBUTION_LINK',
  // DELETE_CONTRIBUTION_LINK = 'DELETE_CONTRIBUTION_LINK',
  // UPDATE_CONTRIBUTION_LINK = 'UPDATE_CONTRIBUTION_LINK',
}
