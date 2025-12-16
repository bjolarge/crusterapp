import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('canps')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'USD' })
  currency: string;

 // @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
 @Column({
  type: 'decimal',
  precision: 12,
  scale: 2,
  default: 0,
  transformer: {
    to: (value: number) => value,
    from: (value: string) => Number(value),
  },
})
  balance: number;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
