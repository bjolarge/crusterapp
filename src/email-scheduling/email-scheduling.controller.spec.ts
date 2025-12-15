import { Test, TestingModule } from '@nestjs/testing';
import { EmailSchedulingController } from './email-scheduling.controller';
import { EmailSchedulingService } from './email-scheduling.service';

describe('EmailSchedulingController', () => {
  let controller: EmailSchedulingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailSchedulingController],
      providers: [EmailSchedulingService],
    }).compile();

    controller = module.get<EmailSchedulingController>(EmailSchedulingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
