import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';

describe('ChatsService', () => {
  let provider: ChatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatsService],
    }).compile();

    provider = module.get<ChatsService>(ChatsService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
