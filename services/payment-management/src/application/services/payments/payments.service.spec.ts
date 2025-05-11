import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';

describe('Payments', () => {
  let provider: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentsService],
    }).compile();

    provider = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
