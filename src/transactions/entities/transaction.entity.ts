// import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// @Entity('transactpath')
// export class Transaction {
//   @PrimaryGeneratedColumn()
//   id: number;
//   @Column()
//   receiverId: number;
//   @Column()
//   amount: number;
// }

import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('transactionspath')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  reference: string;

  @Column({ default: 'SUCCESS' })
  status: string;
}

