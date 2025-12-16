import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('WalletService', () => {
  let service: WalletService;
  let walletRepo: jest.Mocked<Repository<Wallet>>;
  let txRepo: jest.Mocked<Repository<Transaction>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepo = module.get(getRepositoryToken(Wallet));
    txRepo = module.get(getRepositoryToken(Transaction));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a wallet', async () => {
    const wallet = {
      id: 'wallet-1',
      userId: 'user-1',
      currency: 'USD',
      balance: 0,
    } as Wallet;

    walletRepo.create.mockReturnValue(wallet);
    walletRepo.save.mockResolvedValue(wallet);

    const result = await service.createWallet('user-1');

    expect(walletRepo.create).toHaveBeenCalledWith({
      userId: 'user-1',
      currency: 'USD',
      balance: 0,
    });
    expect(walletRepo.save).toHaveBeenCalledWith(wallet);
    expect(result).toEqual(wallet);
  });

  it('should fund a wallet', async () => {
    const wallet = {
      id: 'wallet-1',
      userId: 'user-1',
      balance: 100,
    } as Wallet;

    walletRepo.findOneBy.mockResolvedValue(wallet);
    walletRepo.save.mockResolvedValue(wallet);
    txRepo.save.mockResolvedValue({} as Transaction);

    const result = await service.fundWallet('wallet-1', 200, 'user-1');

    expect(wallet.balance).toBe(300);
    expect(walletRepo.save).toHaveBeenCalledWith(wallet);
    expect(txRepo.save).toHaveBeenCalledWith({
      walletId: 'wallet-1',
      amount: 200,
      type: 'FUND',
    });
    expect(result.balance).toBe(300);
  });

  it('should throw if wallet not found when funding', async () => {
    walletRepo.findOneBy.mockResolvedValue(null);

    await expect(
      service.fundWallet('wallet-1', 100, 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  // ---------------- TRANSFER ----------------

  it('should transfer funds successfully', async () => {
    const sender = {
      id: 'wallet-1',
      userId: 'user-1',
      balance: 500,
    } as Wallet;

    const receiver = {
      id: 'wallet-2',
      balance: 100,
    } as Wallet;

    const mockManager = {
      findOne: jest.fn()
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(receiver),
      save: jest.fn(),
    };

    (walletRepo.manager.transaction as jest.Mock).mockImplementation(
      async (cb) => cb(mockManager),
    );

    const result = await service.transfer(
      'wallet-1',
      { receiverWalletId: 'wallet-2', amount: 200 },
      'user-1',
    );

    expect(sender.balance).toBe(300);
    expect(receiver.balance).toBe(300);
    expect(mockManager.save).toHaveBeenCalledTimes(4); // 2 wallets + 2 txs
    expect(result).toEqual({ message: 'Transfer successful' });
  });

  it('should throw if sender wallet not found', async () => {
    const mockManager = {
      findOne: jest.fn().mockResolvedValueOnce(null),
    };

    (walletRepo.manager.transaction as jest.Mock).mockImplementation(
      async (cb) => cb(mockManager),
    );

    await expect(
      service.transfer(
        'wallet-1',
        { receiverWalletId: 'wallet-2', amount: 100 },
        'user-1',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw if insufficient balance', async () => {
    const sender = {
      id: 'wallet-1',
      userId: 'user-1',
      balance: 50,
    } as Wallet;

    const receiver = {
      id: 'wallet-2',
      balance: 100,
    } as Wallet;

    const mockManager = {
      findOne: jest.fn()
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(receiver),
    };

    (walletRepo.manager.transaction as jest.Mock).mockImplementation(
      async (cb) => cb(mockManager),
    );

    await expect(
      service.transfer(
        'wallet-1',
        { receiverWalletId: 'wallet-2', amount: 100 },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  // ---------------- GET WALLET ----------------

  it('should return wallet and transactions', async () => {
    const wallet = { id: 'wallet-1', userId: 'user-1' } as Wallet;
    const transactions = [{ id: 'tx-1' }] as Transaction[];

    walletRepo.findOneBy.mockResolvedValue(wallet);
    txRepo.find.mockResolvedValue(transactions);

    const result = await service.getWallet('wallet-1', 'user-1');

    expect(result.wallet).toEqual(wallet);
    expect(result.transactions).toEqual(transactions);
  });

  it('should throw if wallet not found when fetching', async () => {
    walletRepo.findOneBy.mockResolvedValue(null);

    await expect(
      service.getWallet('wallet-1', 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });
});
