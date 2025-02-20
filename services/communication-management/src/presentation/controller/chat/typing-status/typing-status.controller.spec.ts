import { Test, TestingModule } from '@nestjs/testing';
import { TypingStatusController } from './typing-status.controller';

describe('TypingStatusController', () => {
  let controller: TypingStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypingStatusController],
    }).compile();

    controller = module.get<TypingStatusController>(TypingStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
