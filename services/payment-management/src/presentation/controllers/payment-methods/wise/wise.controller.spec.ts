import { Test, TestingModule } from '@nestjs/testing';
import { WiseController } from './wise.controller';

describe('WiseController', () => {
  let controller: WiseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WiseController],
    }).compile();

    controller = module.get<WiseController>(WiseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
