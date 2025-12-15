// import { 
//   Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards, Req, 
//   Res,ClassSerializerInterceptor, UseInterceptors, HttpStatus, Query,
//   InternalServerErrorException,
//   UnauthorizedException,
//   HttpException,} from 
// '@nestjs/common';
// import { Request, Response} from 'express';
// import { AuthService } from './auth.service';
// import  UserService  from '../user/user.service';
// import { RegisterDto } from './dto/registerdto';
// import { LocalAuthenticationGuard } from './guard/localAuthentication.guard';
// import JwtAuthenticationGuard from './guard/jwt-authentication.guard';
// import JwtRefreshGuard from './guard/JwtRefreshGuard';
// import { EmailConfirmationService } from '../email-confirmation/email-confirmation.service';
// import { CsrfGenAuth, CsrfInterceptor } from '@tekuconcept/nestjs-csrf';
// import { PasswordResetDto } from './dto/password-reset.dto';
// import { ConfigService } from '@nestjs/config';
// import type RequestWithUser from './interfaces/requestWithUser.interface';
// import { RolesGuard } from '../user/guard/role.guard';
// import { CreateUserByAdminDto } from './dto/createUserByAdminDto';
// import { Roles } from '../user/decorator/roles';
// import Role from '../user/enum/role.enum';
// import { AuthGuard } from '@nestjs/passport';
// @Controller('auth')
// @UseInterceptors(ClassSerializerInterceptor)
// @UseInterceptors(CsrfInterceptor)
// export class AuthController {
//   constructor(
//     private readonly authService: AuthService,
//     private readonly configService: ConfigService,
//     private readonly userService: UserService,
//     private readonly emailConfirmationService: EmailConfirmationService,
//   ) {}

//   //email reset
//   @Post('request-password-reset')
//   async requestPasswordReset(@Body('email') email: string) {
//     await this.userService.requestPasswordReset(email);
//   }

//   @Post('reset-password')
//   async resetPasswordNew(
//     @Query('token') token: string,
//     @Body('newPassword') newPassword: string,
//   ) {
//     await this.userService.resetPassword(token, newPassword);
//   }

//   //register going route
//   @Post('register')
//   async register(@Body() registrationData: RegisterDto) {
//     const user = await this.authService.register(registrationData);
//     await this.emailConfirmationService.sendVerificationLink(
//       registrationData.email,
//     );
//     return user;
//   }

// //   @Post('register')
// // async register(@Body() registrationData: RegisterDto) {
// //   try {
// //     const user = await this.authService.register(registrationData);

// //     try {
// //       await this.emailConfirmationService.sendVerificationLink(
// //         registrationData.email,
// //       );
// //     } catch (emailError) {
// //       console.error('Email sending failed:', emailError);
// //     }

// //     return user;
// //   } catch (error) {
// //     console.error('Register endpoint failed:', error);
// //      throw error;
// //     // throw new HttpException(
// //     //   error.message || 'Something went wrong',
// //     //   HttpStatus.INTERNAL_SERVER_ERROR,
// //    // );
// //   }
// // }


//   //real login with token feature
//   @HttpCode(200)
//   @UseGuards(LocalAuthenticationGuard)
//   @CsrfGenAuth()
//   @Post('login')
//   async logIn(@Req() request: RequestWithUser) {
//     const { user } = request;
//   //  if(user.isEmailConfirmed!==true){
//   //     await this.emailConfirmationService.resendConfirmationLink(request.user.id);
//   //     return new UnauthorizedException(
        
//   //       `This user ${user.name} cannot login, kindly check your email and click on the confirmation link to activate your account`,
//   //     );
//   //   }
//     const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
//       user.id,
//     );
//     const { cookie: refreshTokenCookie, token: refreshToken } =
//       this.authService.getCookieWithJwtRefreshToken(user.id);

//     await this.userService.setCurrentRefreshToken(refreshToken, user.id);

//     request.res.setHeader('Set-Cookie', [
//       accessTokenCookie,
//       refreshTokenCookie,
//     ]);
//     return user;
//   }

//   @UseGuards(LocalAuthenticationGuard)
//   @Post('log-out')
//   @HttpCode(200)
//   async logOut(@Req() request: RequestWithUser) {
//     await this.userService.removeRefreshToken(request.user.id);
//     request.res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
//   }

//   //Login
//   @UseGuards(JwtAuthenticationGuard)
//   @Get()
//   authenticate(@Req() request: RequestWithUser) {
//     const user = request.user;
//     user.password = undefined;
//     console.log('Login');
//     return user;
//   }
//   // handling the refresh token endpoint
//   @UseGuards(JwtRefreshGuard)
//   @Get('refresh')
//   refresh(@Req() request: RequestWithUser) {
//     const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
//       request.user.id,
//     );

//     request.res.setHeader('Set-Cookie', accessTokenCookie);
//     return request.user;
//   }

//   //super admin create othe users with this route in prod
//   @Post('create-userlist')
//   //@Roles(Role.Vendor)
//   //only superadmin can call this
//   @Roles(Role.Vendor)
//   async createUser(@Body() userData: CreateUserByAdminDto) {
//     const user = await this.authService.SuperAdminCreateOtherRole(userData);

//     await this.emailConfirmationService.sendVerificationLink(userData.email);
//     return user;
//   }
// }



import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Req,
  Res,
  ClassSerializerInterceptor,
  UseInterceptors,
  HttpStatus,
  Query,
  InternalServerErrorException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import UserService from '../user/user.service';
import { RegisterDto } from './dto/registerdto';
import { LocalAuthenticationGuard } from './guard/localAuthentication.guard';
import JwtAuthenticationGuard from './guard/jwt-authentication.guard';
import JwtRefreshGuard from './guard/JwtRefreshGuard';
import { EmailConfirmationService } from '../email-confirmation/email-confirmation.service';
import { PasswordResetDto } from './dto/password-reset.dto';
import { ConfigService } from '@nestjs/config';
import type RequestWithUser from './interfaces/requestWithUser.interface';
import { RolesGuard } from '../user/guard/role.guard';
import { CreateUserByAdminDto } from './dto/createUserByAdminDto';
import { Roles } from '../user/decorator/roles';
import Role from '../user/enum/role.enum';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    await this.userService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPasswordNew(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.userService.resetPassword(token, newPassword);
  }

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    const user = await this.authService.register(registrationData);
    // await this.emailConfirmationService.sendVerificationLink(
    //   registrationData.email,
    // );
    return user;
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async logIn(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user } = request;

    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      user.id,
    );
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authService.getCookieWithJwtRefreshToken(user.id);

    await this.userService.setCurrentRefreshToken(refreshToken, user.id);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    return user;
  }

  @UseGuards(LocalAuthenticationGuard)
  @Post('log-out')
  @HttpCode(200)
  async logOut(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.userService.removeRefreshToken(request.user.id);
    res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    user.password = undefined;
    return user;
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      request.user.id,
    );

    res.setHeader('Set-Cookie', accessTokenCookie);
    return request.user;
  }

  @Roles(Role.Vendor)
  @Post('create-userlist')
  async createUser(@Body() userData: CreateUserByAdminDto) {
    const user = await this.authService.SuperAdminCreateOtherRole(userData);
    await this.emailConfirmationService.sendVerificationLink(userData.email);
    return user;
  }
}




