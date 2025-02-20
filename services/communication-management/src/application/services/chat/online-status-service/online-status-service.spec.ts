import { Test, TestingModule } from '@nestjs/testing';
import { OnlineStatusService } from './online-status-service';

describe('OnlineStatusService', () => {
  let provider: OnlineStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnlineStatusService],
    }).compile();

    provider = module.get<OnlineStatusService>(OnlineStatusService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
