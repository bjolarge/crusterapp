import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository } from 'typeorm';
import { TransferWalletDto } from './dto/transfer-wallet.dto';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,

    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>,
  ) {}

  async createWallet(userId: string, currency = 'USD') {
    const wallet = this.walletRepo.create({
      userId,
      currency,
      balance: 0,
    });

    return this.walletRepo.save(wallet);
  }

  async fundWallet(walletId: string, amount: number, userId: string) {
    const wallet = await this.walletRepo.findOneBy({ id: walletId, userId });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    wallet.balance += amount;

    await this.walletRepo.save(wallet);

    await this.txRepo.save({
      walletId,
      amount,
      type: 'FUND',
    });

    return wallet;
  }

  // async transfer(senderWalletId: string, dto: TransferWalletDto, userId: string) {

  //   if (!await this.walletRepo.findOneBy({
  //     id: senderWalletId,
  //     userId,
  //   })) {
  //     throw new NotFoundException('Sender wallet not found');
  //   }

  //   const receiver = await this.walletRepo.findOneBy({
  //     id: dto.receiverWalletId,
  //   });

  //   if (!receiver) {
  //     throw new NotFoundException('Receiver wallet not found');
  //   }

  //   if ((await this.walletRepo.findOneBy({
  //     id: senderWalletId,
  //     userId,
  //   })).balance < dto.amount) {
  //     throw new BadRequestException('Insufficient balance');
  //   }

  //   // TRANSACTION (important for balance integrity)
  //   (await this.walletRepo.findOneBy({
  //     id: senderWalletId,
  //     userId,
  //   })).balance -= dto.amount;
  //   receiver.balance += dto.amount;

  //   await this.walletRepo.manager.transaction(async (manager) => {
  //     await manager.save((await this.walletRepo.findOneBy({
  //         id: senderWalletId,
  //         userId,
  //       })));
  //     await manager.save(receiver);

  //     await manager.save(Transaction, {
  //       walletId: (await this.walletRepo.findOneBy({
  //         id: senderWalletId,
  //         userId,
  //       })).id,
  //       amount: dto.amount,
  //       type: 'TRANSFER_OUT',
  //     });

  //     await manager.save(Transaction, {
  //       walletId: receiver.id,
  //       amount: dto.amount,
  //       type: 'TRANSFER_IN',
  //     });
  //   });

  //   return { message: 'Transfer successful' };
  // }

  async transfer(
  senderWalletId: string,
  dto: TransferWalletDto,
  userId: string,
) {
  return this.walletRepo.manager.transaction(async (manager) => {
    const sender = await manager.findOne(Wallet, {
      where: { id: senderWalletId, userId },
    });

    if (!sender) {
      throw new NotFoundException('Sender wallet not found');
    }

    const receiver = await manager.findOne(Wallet, {
      where: { id: dto.receiverWalletId },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver wallet not found');
    }

    const senderBalance = Number(sender.balance);
    const receiverBalance = Number(receiver.balance);

    if (senderBalance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    sender.balance = senderBalance - dto.amount;
    receiver.balance = receiverBalance + dto.amount;

    await manager.save(sender);
    await manager.save(receiver);

    await manager.save(Transaction, {
      walletId: sender.id,
      amount: dto.amount,
      type: 'TRANSFER_OUT',
    });

    await manager.save(Transaction, {
      walletId: receiver.id,
      amount: dto.amount,
      type: 'TRANSFER_IN',
    });

    return { message: 'Transfer successful' };
  });
}


  async getWallet(walletId: string, userId: string) {
    const wallet = await this.walletRepo.findOneBy({ id: walletId, userId });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const transactions = await this.txRepo.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
    });

    return {
      wallet,
      transactions,
    };
  }
}

