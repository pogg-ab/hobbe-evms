import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message-service';

describe('MessageService', () => {
  let provider: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageService],
    }).compile();

    provider = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
