import { Test, TestingModule } from '@nestjs/testing';
import { EmailConfirmationService } from './email-confirmation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailConfirmation } from './entities/email-confirmation.entity';

describe('EmailConfirmationService', () => {
  let service: EmailConfirmationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailConfirmationService,
        {
          provide:getRepositoryToken(EmailConfirmation),
          useValue:{}
          
        }
      ],
    }).compile();

    service = module.get<EmailConfirmationService>(EmailConfirmationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
