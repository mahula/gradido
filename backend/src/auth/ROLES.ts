import { RoleNames } from '@/graphql/enum/RoleNames'

import { ADMIN_RIGHTS } from './ADMIN_RIGHTS'
import { INALIENABLE_RIGHTS } from './INALIENABLE_RIGHTS'
import { MODERATOR_RIGHTS } from './MODERATOR_RIGHTS'
import { Role } from './Role'
import { USER_RIGHTS } from './USER_RIGHTS'

export const ROLE_UNAUTHORIZED = new Role(RoleNames.ROLE_NAME_UNAUTHORIZED, INALIENABLE_RIGHTS)
export const ROLE_USER = new Role(RoleNames.ROLE_NAME_USER, [
  ...INALIENABLE_RIGHTS,
  ...USER_RIGHTS,
])
export const ROLE_MODERATOR = new Role(RoleNames.ROLE_NAME_MODERATOR, [
  ...INALIENABLE_RIGHTS,
  ...USER_RIGHTS,
  ...MODERATOR_RIGHTS,
])
export const ROLE_ADMIN = new Role(RoleNames.ROLE_NAME_ADMIN, [
  ...INALIENABLE_RIGHTS,
  ...USER_RIGHTS,
  ...MODERATOR_RIGHTS,
  ...ADMIN_RIGHTS,
])

// TODO from database
export const ROLES = [ROLE_UNAUTHORIZED, ROLE_USER, ROLE_MODERATOR, ROLE_ADMIN]
