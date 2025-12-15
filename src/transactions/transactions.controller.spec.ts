// import { Test, TestingModule } from '@nestjs/testing';
// import { TransactionsController } from './transactions.controller';
// import { TransactionsService } from './transactions.service';

// describe('TransactionsController', () => {
//   let controller: TransactionsController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [TransactionsController],
//       providers: [TransactionsService],
//     }).compile();

//     controller = module.get<TransactionsController>(TransactionsController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import User from '../user/entities/user.entity';
import { BadRequestException } from '@nestjs/common';

describe('TransactionsController (mocked)', () => {
  let controller: TransactionsController;
  let transactionsService: Partial<TransactionsService>;

  beforeEach(async () => {
    transactionsService = {
      deposit: jest.fn(),
      transfer: jest.fn(),
      history: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionsService, useValue: transactionsService },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  describe('deposit', () => {
    it('should call deposit and return result', async () => {
      const user = { id: 1 } as User;
      const depositDto: DepositDto = { amount: 100 };
      const mockResult = { message: 'Deposit successful', newBalance: 200 };

      (transactionsService.deposit as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.deposit({ user } as any, depositDto);
      expect(transactionsService.deposit).toHaveBeenCalledWith(user.id, depositDto);
      expect(result).toEqual(mockResult);
    });

    it('should throw if deposit fails', async () => {
      const user = { id: 1 } as User;
      const depositDto: DepositDto = { amount: 100 };

      (transactionsService.deposit as jest.Mock).mockRejectedValue(
        new BadRequestException('Invalid deposit'),
      );

      await expect(controller.deposit({ user } as any, depositDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('transfer', () => {
    it('should call transfer and return result', async () => {
      const user = { id: 1 } as User;
      const transferDto: TransferDto = { receiverId: 2, amount: 50 };
      const mockResult = { message: 'Transfer successful', senderBalance: 50, receiverBalance: 150 };

      (transactionsService.transfer as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.transfer({ user } as any, transferDto);
      expect(transactionsService.transfer).toHaveBeenCalledWith(user.id, transferDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('history', () => {
    it('should return user history', async () => {
      const user = { id: 1 } as User;
      const mockHistory = [{ id: 1, amount: 50 }];

      (transactionsService.history as jest.Mock).mockResolvedValue(mockHistory);

      const result = await controller.history(user);
      expect(transactionsService.history).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(mockHistory);
    });
  });
});
