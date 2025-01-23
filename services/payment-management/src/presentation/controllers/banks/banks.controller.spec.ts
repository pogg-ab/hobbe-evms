import { Test, TestingModule } from '@nestjs/testing';
import { BanksController } from './banks-accounts.controller';

describe('BanksController', () => {
  let controller: BanksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BanksController],
    }).compile();

    controller = module.get<BanksController>(BanksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
