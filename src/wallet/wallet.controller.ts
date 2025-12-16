import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import JwtAuthenticationGuard from '../auth/guard/jwt-authentication.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferWalletDto } from './dto/transfer-wallet.dto';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse } from '@nestjs/swagger';

@UseGuards(JwtAuthenticationGuard)
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
    @ApiBody({ type: CreateWalletDto })
    @ApiOkResponse({ description: 'Wallet created successfully successful' })
    @ApiBadRequestResponse({
      description: 'cannot create wallet',
    })
  createWallet(@GetUser() user, @Body() dto: CreateWalletDto) {
    return this.walletService.createWallet(user.id, dto.currency);
  }

  @Post(':id/fund')
  fundWallet(
    @Param('id') walletId: string,
    @Body() dto: FundWalletDto,
    @GetUser() user,
  ) {
    return this.walletService.fundWallet(walletId, dto.amount, user.id);
  }

  @Post(':id/transfer')
  transfer(
    @Param('id') walletId: string,
    @Body() dto: TransferWalletDto,
    @GetUser() user,
  ) {
    return this.walletService.transfer(walletId, dto, user.id);
  }

  @Get(':id')
  getWallet(@Param('id') walletId: string, @GetUser() user) {
    return this.walletService.getWallet(walletId, user.id);
  }
}
