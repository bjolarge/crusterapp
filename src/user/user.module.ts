import { Module } from '@nestjs/common';
import UserService from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { PasswordResetToken } from './entities/password.reset-token.entity';
import { EmailModule } from '../email/email.module';
//import { EmailModule } from 'src/email/email.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([User, PasswordResetToken]),
    EmailModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports:[TypeOrmModule,UserService]
})
export class UserModule {}