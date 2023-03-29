import { Decimal } from 'decimal.js-light'
import { User as DbUser } from '@entity/User'
import { Contribution as DbContribution } from '@entity/Contribution'
import { Event as DbEvent } from '@entity/Event'
import { Event } from './Event'
import { EventType } from './EventType'

export const EVENT_ADMIN_CONTRIBUTION_DENY = async (
  user: DbUser,
  moderator: DbUser,
  contribution: DbContribution,
  amount: Decimal,
): Promise<DbEvent> =>
  Event(
    EventType.ADMIN_CONTRIBUTION_DENY,
    user,
    moderator,
    null,
    null,
    contribution,
    null,
    null,
    null,
    amount,
  ).save()
