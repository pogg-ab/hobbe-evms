import { Test, TestingModule } from '@nestjs/testing';
import { ChatUserService } from './chat-user-service';

describe('ChatUserService', () => {
  let provider: ChatUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatUserService],
    }).compile();

    provider = module.get<ChatUserService>(ChatUserService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
