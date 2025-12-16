import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferWalletDto } from './dto/transfer-wallet.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('WalletController', () => {
  let controller: WalletController;
  let service: Partial<Record<keyof WalletService, jest.Mock>>;

  const mockUser = { id: 'user-1', email: 'test@example.com' };

  beforeEach(async () => {
    service = {
      createWallet: jest.fn(),
      fundWallet: jest.fn(),
      transfer: jest.fn(),
      getWallet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: service }],
    }).compile();

    controller = module.get<WalletController>(WalletController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a wallet', async () => {
    const dto: CreateWalletDto = { currency: 'USD' };
    const wallet = { id: 'wallet-1', balance: 0, currency: 'USD', userId: 'user-1' };

    service.createWallet.mockResolvedValue(wallet);

    const result = await controller.createWallet(mockUser, dto);

    expect(service.createWallet).toHaveBeenCalledWith(mockUser.id, dto.currency);
    expect(result).toEqual(wallet);
  });

  it('should fund a wallet', async () => {
    const dto: FundWalletDto = { amount: 200 };
    const wallet = { id: 'wallet-1', balance: 500 };

    service.fundWallet.mockResolvedValue(wallet);

    const result = await controller.fundWallet('wallet-1', dto, mockUser);

    expect(service.fundWallet).toHaveBeenCalledWith('wallet-1', dto.amount, mockUser.id);
    expect(result).toEqual(wallet);
  });

  it('should transfer funds', async () => {
    const dto: TransferWalletDto = { receiverWalletId: 'wallet-2', amount: 100 };
    const response = { message: 'Transfer successful' };

    service.transfer.mockResolvedValue(response);

    const result = await controller.transfer('wallet-1', dto, mockUser);

    expect(service.transfer).toHaveBeenCalledWith('wallet-1', dto, mockUser.id);
    expect(result).toEqual(response);
  });

  it('should get wallet details', async () => {
    const walletData = { wallet: { id: 'wallet-1', balance: 300 }, transactions: [] };

    service.getWallet.mockResolvedValue(walletData);

    const result = await controller.getWallet('wallet-1', mockUser);

    expect(service.getWallet).toHaveBeenCalledWith('wallet-1', mockUser.id);
    expect(result).toEqual(walletData);
  });

  it('should propagate errors from service', async () => {
    service.getWallet.mockRejectedValue(new NotFoundException('Wallet not found'));

    await expect(controller.getWallet('invalid-wallet', mockUser)).rejects.toThrow(NotFoundException);
  });
});

