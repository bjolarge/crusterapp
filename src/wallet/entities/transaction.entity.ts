import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('capse')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @Column({ type: 'enum', enum: ['FUND', 'TRANSFER_IN', 'TRANSFER_OUT'] })
  type: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  reference?: string;

  @CreateDateColumn()
  createdAt: Date;
}
