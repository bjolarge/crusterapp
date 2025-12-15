import { Body, Controller, UseGuards, Post } from '@nestjs/common';
import JwtAuthenticationGuard from '../auth/guard/jwt-authentication.guard';
import {EmailSchedulingService} from '../email-scheduling/email-scheduling.service';
import EmailScheduleDto from './dto/emailSchedule.dto';

@Controller('email-scheduling')
export  class EmailSchedulingController {
  constructor(
    private readonly emailSchedulingService: EmailSchedulingService,
  ) {}

  @Post('schedule')
 // @UseGuards(JwtAuthenticationGuard)
  async scheduleEmail(@Body() emailSchedule: EmailScheduleDto) {
    this.emailSchedulingService.scheduleEmail(emailSchedule);
  }
}