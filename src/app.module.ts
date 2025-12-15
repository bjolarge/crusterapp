import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import * as Joi from 'joi';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module';
import { EmailSchedulingModule } from './email-scheduling/email-scheduling.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { createModule } from 'create-nestjs-middleware-module';
import { TransactionsModule } from './transactions/transactions.module';
import session from 'express-session';
import cookieParser from 'cookie-parser';

//this prevents CSRF attacks
// const CookieParserModuleBase = createModule(() => {
//   return cookieParser();
// });

const SessionModuleBase = createModule(() => {
  return session({
    // secret:'my-secret-session-key',
    secret: process.env.MYSECRETSESSIONKEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
    },
  });
});
@Module({
  imports: [
    //adding the rate limiting for throttling
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    CacheModule.register(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        //PORT
        PORT: Joi.number().required(),
        //SECRETS
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        // Refresh token part
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        //Email Service
        EMAIL_SERVICE: Joi.string().required(),
        EMAIL_USER: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        EMAIL_CONFIRMATION_URL: Joi.string().required(),
        JWT_VERIFICATION_TOKEN_SECRET: Joi.string().required(),
        JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: Joi.string().required(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        ssl: configService.get('DB_SSL'),
        autoLoadEntities: true,

        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    EmailModule,
    EmailConfirmationModule,
    EmailSchedulingModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
