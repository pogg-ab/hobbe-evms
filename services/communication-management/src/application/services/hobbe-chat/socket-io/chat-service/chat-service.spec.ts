import { Test, TestingModule } from '@nestjs/testing';
import { HobbeChatService } from './hobbe-chat-service';

describe('HobbeChatService', () => {
  let provider: HobbeChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HobbeChatService],
    }).compile();

    provider = module.get<HobbeChatService>(HobbeChatService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
