import { Module } from '@nestjs/common';
import {EmailSchedulingService} from '../email-scheduling/email-scheduling.service';
import { EmailModule } from '../email/email.module';
import {EmailSchedulingController} from '../email-scheduling/email-scheduling.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    EmailModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        service: configService.get('EMAIL_SERVICE'),
        user: configService.get('EMAIL_USER'),
        password: configService.get('EMAIL_PASSWORD'),
      }),
    }),
  ],
  controllers: [EmailSchedulingController],
  providers: [EmailSchedulingService],
})
export class EmailSchedulingModule {}