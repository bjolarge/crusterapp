import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import Role from '../enum/role.enum';
import { PasswordResetToken } from './password.reset-token.entity';

@Entity('usereentityelane')
class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public email: string;

  @Column()
  public name: string;

  @Column()
  @Exclude()
  public password: string;

  @Column({ nullable: false })
  public phoneNumber?: string;

  @Column({ nullable: false })
  public address?: string;

  @Column({
    nullable: true,
  })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @Column({ default: false })
  public isRegisteredWithGoogle: boolean;

  //for the role management
  @Column({ default: false })
  public isEmailConfirmed: boolean;
  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.User],
  })
  public roles?: Role[];

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  passwordResetTokens: PasswordResetToken[];

  // I added this for my account balance setup
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  balance: number;
}
 
export default User;