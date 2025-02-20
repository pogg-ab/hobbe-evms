import { Test, TestingModule } from '@nestjs/testing';
import { TypingStatusService } from './typing-status.service';

describe('TypingStatusService', () => {
  let provider: TypingStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypingStatusService],
    }).compile();

    provider = module.get<TypingStatusService>(TypingStatusService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
