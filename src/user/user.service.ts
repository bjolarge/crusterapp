import { BadRequestException, HttpException, HttpStatus,
   Request, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
//import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordResetToken } from './entities/password.reset-token.entity';
import { randomBytes } from 'crypto';
//import { EmailService } from 'src/email/email.service';
import { EmailService } from '../email/email.service';
import Role from './enum/role.enum';
import { ConfigService } from '@nestjs/config';
//import { hashPassword } from 'src/common/utils';
import { hashPassword } from '../common/utils';
//import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto';
import { CreateUserByAdminDto } from '../auth/dto/createUserByAdminDto';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly mailerService:EmailService,
    private readonly configService:ConfigService,

    @InjectRepository(PasswordResetToken) private tokenRepository: Repository<PasswordResetToken>,
  ) {}

   // for reset password
   // enter your registered email in postman for test
   async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    // Generate a token
    const token = randomBytes(32).toString('hex');
    const resetToken = this.tokenRepository.create({ token, user });
    await this.tokenRepository.save(resetToken);

    const baseurl = this.configService.get('BASE_URL');
    const url = `${baseurl}/reset-password${token}`;
 
    const text = `To reset the password, click here: ${url}`;
 
    // Send the email
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      //template: 'password-reset', 
      text
    });
  }

  // Enter new newPassword in postman field
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.tokenRepository.findOne({ where: { token }, relations: ['user'] });
    if (!resetToken) throw new BadRequestException('Invalid or expired token');

    const user = resetToken.user;
    user.password = await hashPassword(newPassword); // Ensure you're using the same hashing method as during registration

    //user.password = newPassword
    await this.usersRepository.save(user);

    // Clean up the used token
    await this.tokenRepository.remove(resetToken);
  }

  // this handles the refresh feature
  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      currentHashedRefreshToken
    });
  }
  // this handles the refreshtoken
  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
    const user = await this.getById(userId);

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
      
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }
  //this allows us to sum up the total number of app user 
  async findusercount(){
    const usercount = await this.usersRepository.count();
    return usercount;
  }

  // this returns the list of all the total users in the app
  findAll( paginationQuery:PaginationQueryDto) {
    const {limit,offset} = paginationQuery;
    return this.usersRepository.find(
    {
      skip:offset,
      take:limit,
    }
    );
  }

  //remove refreshtoken
  async removeRefreshToken(userId: number) {
    return this.usersRepository.update(userId, {
      currentHashedRefreshToken: null
    });
  }

  //email confirmation
  async markEmailAsConfirmed(email: string) {
    return this.usersRepository.update({ email }, {
      isEmailConfirmed: true
    });
  }

  //get userById
  async getById(id) {
    //const user = await this.usersRepository.findOneBy(id );
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      return user;
    }
    throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
  }

  //get by email otp
  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({
      email,
    });
  }

  async getUserById(id:number){
    const user = await this.usersRepository.count();
  }


  //get user if refreshToken
  
//close refreshToken
  async getByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({email});
    if (user) {
      return user;
    }
    throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
  }
 
  async create(userData: CreateUserDto) {
    const newUser = await this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);
    return newUser;
  }
  async createSuperAdmin(userData: CreateUserByAdminDto) {
    const newUser = await this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  //findbyId
  async findById(id): Promise<User | null> {
    return await this.usersRepository.findOneBy({id});

  }

  async remove(id:string) {

    const user  = await this.usersRepository.delete(id);
 
     if (user.affected === 0) {
       throw new NotFoundException(`User with Id ${id} not found`);
     }
   }

   //filter user by role
   async findUsersByRole(roles: Role): Promise<User[]> {
    return this.usersRepository.find({
      where: { roles },
    });
  }
  
}