/* eslint-disable type-graphql/invalid-nullable-input-type */
import { ArgsType, Field, Int } from 'type-graphql'

import { Order } from '@enum/Order'

@ArgsType()
export class Paginated {
  @Field(() => Int, { nullable: true })
  currentPage?: number

  @Field(() => Int, { nullable: true })
  pageSize?: number

  @Field(() => Order, { nullable: true })
  order?: Order
}
