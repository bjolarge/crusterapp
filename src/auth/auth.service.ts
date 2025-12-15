import { BadRequestException, HttpException, HttpStatus, Injectable,Request } from '@nestjs/common';
import  UserService  from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/registerdto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import User from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { PasswordResetDto } from './dto/password-reset.dto';
import { PasswordResetToken } from 'src/user/entities/password.reset-token.entity';
import TokenPayload from './interfaces/tokenPayload.interface';
import { EmailService } from '../email/email.service';
import { CreateUserByAdminDto } from './dto/createUserByAdminDto';
import Role from '../user/enum/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly usersService:UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService:EmailService

  ) {}

  public async register(registrationData:RegisterDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const createdUser = await this.usersService.create({
        //refreshToken,
        ...registrationData,
        password: hashedPassword,
      });
     
      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      if (error?.code === '23505') {
        throw new BadRequestException('User with this email already exists');
      }
      throw error
      console.error('Register error:', error);
      //throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

async SuperAdminCreateOtherRole(dto: CreateUserByAdminDto) {
    const existingUser = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new HttpException('User with this email already exists', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
     ...dto,
        password: hashedPassword,
         roles: dto.roles ?? [Role.Vendor],
    });

    const created = await this.usersRepository.save(user);
    created.password = undefined;

    return {
      message: 'User created successfully',
      user: created,
    };
  }

  //logging
  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }
   
  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword
    );
    if (!isPasswordMatching) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }

  public getCookieWithJwtToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
  }

  public getCookieForLogOut() {
   // return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
   return [
    'Authentication=; HttpOnly; Path=/; Max-Age=0',
    'Refresh=; HttpOnly; Path=/; Max-Age=0'
  ];
  }
  //get cookies for logout
  public getCookiesForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  public async removeRefreshToken(userId: number) {
    return this.usersRepository.update(userId, {
      currentHashedRefreshToken: null
    });
  }

  //get cookie with JWT TOKEN
  public getCookieWithJwtAccessToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`
    });
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
  }
 
  public getCookieWithJwtRefreshToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`;
    return {
      cookie,
      token,
    };
  }

  //logic to see if refresh token matches
  async getById(id) {
    const user = await this.usersRepository.findOneBy({ id });
    if (user) {
      return user;
    }
    throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
  }
 
  async getUserIfRefreshTokenMatches(refreshToken: string, id: string) {
    const user = await this.getById(id);
 
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken
    );
 
    if (isRefreshTokenMatching) {
      return user;
    }
  }

  //verify Token
  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        //secret: this.configService.get<string>('jWT_SECRET'),
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usersService.findById(decoded.sub);
      if (!user || user === null) {
        throw new HttpException(
          'token could not be verified',
          HttpStatus.BAD_REQUEST,
        );
      }

      delete user.password;
      return user;
    } catch (err) {
      throw new HttpException('invalid token', HttpStatus.BAD_REQUEST);
    }
  }
}


// import { HttpException, HttpStatus, Injectable,Request } from '@nestjs/common';
// import  UserService  from '../user/user.service';
// import * as bcrypt from 'bcryptjs';
// import { RegisterDto } from './dto/registerdto';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import { InjectRepository } from '@nestjs/typeorm';
// import User from '../user/entities/user.entity';
// import { Repository } from 'typeorm';
// import { PasswordResetDto } from './dto/password-reset.dto';
// import { PasswordResetToken } from 'src/user/entities/password.reset-token.entity';
// import TokenPayload from './interfaces/tokenPayload.interface';
// import { EmailService } from '../email/email.service';
// import { CreateUserByAdminDto } from './dto/createUserByAdminDto';
// import Role from '../user/enum/role.enum';


// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectRepository(User)
//     private usersRepository: Repository<User>,
//     private readonly usersService:UserService,
//     private readonly jwtService: JwtService,
//     private readonly configService: ConfigService,
//     private readonly emailService:EmailService

//   ) {}

//   public async register(registrationData:RegisterDto) {
//     const hashedPassword = await bcrypt.hash(registrationData.password, 10);
//     try {
//       const createdUser = await this.usersService.create({
//         //refreshToken,
//         ...registrationData,
//         password: hashedPassword,
//       });
     
//       createdUser.password = undefined;
//       return createdUser;
//     } catch (error) {
//       // if (error?.code === PostgresErrorCode.UniqueViolation) {
//       //   throw new HttpException('User with that email already exists', HttpStatus.BAD_REQUEST);
//       // }
//       console.error('Register error:', error);
//       //throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

// async SuperAdminCreateOtherRole(dto: CreateUserByAdminDto) {
//     const existingUser = await this.usersRepository.findOne({ where: { email: dto.email } });
//     if (existingUser) {
//       throw new HttpException('User with this email already exists', HttpStatus.BAD_REQUEST);
//     }

//     const hashedPassword = await bcrypt.hash(dto.password, 10);

//     const user = this.usersRepository.create({
//      ...dto,
//         password: hashedPassword,
//          roles: dto.roles ?? [Role.Vendor],
//     });

//     const created = await this.usersRepository.save(user);
//     created.password = undefined;

//     return {
//       message: 'User created successfully',
//       user: created,
//     };
//   }

//   //logging
//   public async getAuthenticatedUser(email: string, plainTextPassword: string) {
//     try {
//       const user = await this.usersService.getByEmail(email);
//       await this.verifyPassword(plainTextPassword, user.password);
//       user.password = undefined;
//       return user;
//     } catch (error) {
//       throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
//     }
//   }
   
//   private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
//     const isPasswordMatching = await bcrypt.compare(
//       plainTextPassword,
//       hashedPassword
//     );
//     if (!isPasswordMatching) {
//       throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
//     }
//   }

//   public getCookieWithJwtToken(userId: number) {
//     const payload: TokenPayload = { userId };
//     const token = this.jwtService.sign(payload);
//     return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
//   }

//   public getCookieForLogOut() {
//    // return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
//    return [
//     'Authentication=; HttpOnly; Path=/; Max-Age=0',
//     'Refresh=; HttpOnly; Path=/; Max-Age=0'
//   ];
//   }
//   //get cookies for logout
//   public getCookiesForLogOut() {
//     return [
//       'Authentication=; HttpOnly; Path=/; Max-Age=0',
//       'Refresh=; HttpOnly; Path=/; Max-Age=0',
//     ];
//   }

//   public async removeRefreshToken(userId: number) {
//     return this.usersRepository.update(userId, {
//       currentHashedRefreshToken: null
//     });
//   }

//   //get cookie with JWT TOKEN
//   public getCookieWithJwtAccessToken(userId: number) {
//     const payload: TokenPayload = { userId };
//     const token = this.jwtService.sign(payload, {
//       secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
//       expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`
//     });
//     return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
//   }
 
//   public getCookieWithJwtRefreshToken(userId: number) {
//     const payload: TokenPayload = { userId };
//     const token = this.jwtService.sign(payload, {
//       secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
//       expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`
//     });
//     const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`;
//     return {
//       cookie,
//       token,
//     };
//   }

//   //logic to see if refresh token matches
//   async getById(id) {
//     const user = await this.usersRepository.findOneBy({ id });
//     if (user) {
//       return user;
//     }
//     throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
//   }
 
//   async getUserIfRefreshTokenMatches(refreshToken: string, id: string) {
//     const user = await this.getById(id);
 
//     const isRefreshTokenMatching = await bcrypt.compare(
//       refreshToken,
//       user.currentHashedRefreshToken
//     );
 
//     if (isRefreshTokenMatching) {
//       return user;
//     }
//   }

//   //verify Token
//   async verifyToken(token: string): Promise<User | null> {
//     try {
//       const decoded = await this.jwtService.verifyAsync(token, {
//         //secret: this.configService.get<string>('jWT_SECRET'),
//         secret: this.configService.get<string>('JWT_SECRET'),
//       });

//       const user = await this.usersService.findById(decoded.sub);
//       if (!user || user === null) {
//         throw new HttpException(
//           'token could not be verified',
//           HttpStatus.BAD_REQUEST,
//         );
//       }

//       delete user.password;
//       return user;
//     } catch (err) {
//       throw new HttpException('invalid token', HttpStatus.BAD_REQUEST);
//     }
//   }
// }


