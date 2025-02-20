import { Test, TestingModule } from '@nestjs/testing';
import { OnlineStatusController } from './online-status.controller';

describe('OnlineStatusController', () => {
  let controller: OnlineStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnlineStatusController],
    }).compile();

    controller = module.get<OnlineStatusController>(OnlineStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
