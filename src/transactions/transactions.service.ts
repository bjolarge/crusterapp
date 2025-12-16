import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import User from '../user/entities/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

async transfer(senderId: number, transferDto: TransferDto) {
  const { receiverId, amount } = transferDto;

  if (senderId === receiverId) {
    throw new BadRequestException('You cannot transfer money to yourself');
  }

  return this.dataSource.transaction(async (manager) => {
    const sender = await manager.findOne(User, {
      where: { id: senderId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!sender) throw new BadRequestException('Sender not found');

    const receiver = await manager.findOne(User, {
      where: { id: receiverId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!receiver) throw new BadRequestException('Receiver not found');

    const senderBalance = Number(sender.balance);
    const receiverBalance = Number(receiver.balance);
    const transferAmount = Number(amount);

    if (senderBalance < transferAmount) {
      throw new BadRequestException('Insufficient balance');
    }

    sender.balance = Number((senderBalance - transferAmount).toFixed(2));
    receiver.balance = Number((receiverBalance + transferAmount).toFixed(2));

    await manager.save(sender);
    await manager.save(receiver);

    // transaction history is saved to db
    const transactionhistory = manager.create(Transaction, {
      senderId,
      receiverId,
      amount: transferAmount,
    });
    await manager.save(transactionhistory);

    return {
      message: 'Transfer successful',
      senderBalance: sender.balance,
      receiverBalance: receiver.balance,
    };
  });
}

  //  async deposit(userId: number, depositDto: DepositDto) {
  //   const { amount } = depositDto;

  //   const user = await this.userRepository.findOne({ where: { id: userId } });

  //   if (!user) {
  //     throw new BadRequestException('User not found');
  //   }

  //   user.balance = Number(user.balance) + Number(amount);

  //   await this.userRepository.save(user);

  //   return {
  //     message: 'Deposit successful',
  //     newBalance: user.balance,
  //   };
  // }

  // Add the import for your TransactionRepository and inject it in the constructor
// ...


// Service File (`transactions.service.ts`):

async deposit(userId: number, depositDto: DepositDto) {
    const { amount } = depositDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // --- Core Logic: Update Balance ---
    user.balance = Number(user.balance) + Number(amount);
    await this.userRepository.save(user);
    // ----------------------------------

    const SYSTEM_SENDER_ID = 0; // <<< Replace 0 with your actual system sender ID

    const transaction = this.transactionRepo.create({
      // The user is the RECEIVER (money flows into their account)
      receiverId: userId, 
      
      // The SENDER is the designated System/External Source ID (different from userId)
      senderId: SYSTEM_SENDER_ID, // <<< Ensures senderId != receiverId
      
      amount: amount,
      currency: 'USD', 
      status: 'SUCCESS',
    });
    
    await this.transactionRepo.save(transaction);

    return {
      message: 'Deposit successful',
      newBalance: user.balance,
    };
}

  // async history(userId: number) {
  //   return this.transactionRepo.find({
  //     where: [{ senderId: userId }, { receiverId: userId }],
  //     order: { createdAt: 'DESC' },
  //   });
  // }

  async history(userId: number) {
  // Finds transactions where:
  // (user is the SENDER) OR (user is the RECEIVER - this covers the deposit)
  return this.transactionRepo.find({
    where: [
      { senderId: userId }, 
      { receiverId: userId }
    ],
    order: { createdAt: 'DESC' },
  });
}
}
