import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { DataSource, Repository } from 'typeorm';
import User from '../user/entities/user.entity';
import { Transaction } from './entities/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

describe('TransactionsService (mocked)', () => {
  let service: TransactionsService;
  let userRepo: Partial<Repository<User>>;
  let transactionRepo: Partial<Repository<Transaction>>;

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    transactionRepo = {
      save: jest.fn(),
      find: jest.fn(),
    };

    const dataSourceMock = {
      transaction: jest.fn().mockImplementation(async (cb) => cb()),
      getRepository: jest.fn().mockImplementation((entity) => {
        if (entity === User) return userRepo;
        if (entity === Transaction) return transactionRepo;
        return null;
      }),
    } as unknown as DataSource;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Transaction), useValue: transactionRepo },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should deposit successfully', async () => {
    const user = { id: 1, balance: 100 };
    (userRepo.findOne as jest.Mock).mockResolvedValue(user);
    (userRepo.save as jest.Mock).mockImplementation(async (u) => u);

    const result = await service.deposit(1, { amount: 50 });
    expect(result.newBalance).toBe(150);
    expect(result.message).toBe('Deposit successful');
  });

  it('should throw if user not found', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(null);
    await expect(service.deposit(999, { amount: 50 })).rejects.toThrow(BadRequestException);
  });
});
