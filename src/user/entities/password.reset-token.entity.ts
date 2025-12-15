import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import User from './user.entity';

@Entity('resetpassword')
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  token: string;

  @ManyToOne(() => User, user => user.passwordResetTokens)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}