import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import JwtAuthenticationGuard from '../auth/guard/jwt-authentication.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import User from '../user/entities/user.entity';
import RequestWithUser from '../auth/interfaces/requestWithUser.interface';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse } from '@nestjs/swagger';

@Controller('transactions')
@UseGuards(JwtAuthenticationGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthenticationGuard)
  @Post('transfer')
  @ApiBody({ type: TransferDto })
  @ApiOkResponse({ description: 'Transfer successful' })
  @ApiBadRequestResponse({
    description: 'Insufficient balance or invalid input',
  })
  transfer(@Req() req: RequestWithUser, @Body() transferDto: TransferDto) {
    const senderId = req.user.id;
    return this.transactionsService.transfer(senderId, transferDto);
  }

  //fund koinsave first
  @UseGuards(JwtAuthenticationGuard)
  @Post('deposit')
  @ApiBody({ type: DepositDto })
  @ApiOkResponse({ description: 'Deposit successful' })
  @ApiBadRequestResponse({ description: 'Invalid deposit amount' })
  deposit(@Req() req: RequestWithUser, @Body() depositDto: DepositDto) {
    const userId = req.user.id;
    return this.transactionsService.deposit(userId, depositDto);
  }

  @Get('history')
  @ApiOkResponse({ description: 'Returns current user history' })
  async history(@GetUser() user: User) {
    return this.transactionsService.history(user.id);
  }
}
