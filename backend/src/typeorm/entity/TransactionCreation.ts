import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Timestamp, OneToOne, JoinColumn } from 'typeorm'
import { Transaction } from './Transaction'

@Entity('transaction_creations')
export class TransactionCreation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'transaction_id' })
  transactionId: number

  @Column({ name: 'state_user_id' })
  userId: number

  @Column()
  amount: number

  @Column({ name: 'target_date', type: 'timestamp' })
  targetDate: Timestamp

  @OneToOne(() => Transaction)
  @JoinColumn() 
  transaction: Transaction

}
