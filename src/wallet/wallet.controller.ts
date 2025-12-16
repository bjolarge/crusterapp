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
   @ApiBody({ type: FundWalletDto })
    @ApiOkResponse({ description: 'Wallet funded successfully' })
    @ApiBadRequestResponse({
      description: 'cannot fund wallet',
    })
  fundWallet(
    @Param('id') walletId: string,
    @Body() dto: FundWalletDto,
    @GetUser() user,
  ) {
    return this.walletService.fundWallet(walletId, dto.amount, user.id);
  }

  @Post(':id/transfer')
  @ApiBody({ type: TransferWalletDto })
    @ApiOkResponse({ description: 'Transfer Wallet successfully' })
    @ApiBadRequestResponse({
      description: 'cannot transfer wallet successfully',
    })
  transfer(
    @Param('id') walletId: string,
    @Body() dto: TransferWalletDto,
    @GetUser() user,
  ) {
    return this.walletService.transfer(walletId, dto, user.id);
  }

  @Get(':id')
    @ApiOkResponse({ description: ' Wallet history retrieved successfully' })
    @ApiBadRequestResponse({
      description: 'cannot retrieve wallet records successfully',
    })
  getWallet(@Param('id') walletId: string, @GetUser() user) {
    return this.walletService.getWallet(walletId, user.id);
  }
}
