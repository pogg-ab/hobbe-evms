import { Test, TestingModule } from '@nestjs/testing';
import { TicetsListController } from './tickets.controller';

describe('TicetsListController', () => {
  let controller: TicetsListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicetsListController],
    }).compile();

    controller = module.get<TicetsListController>(TicetsListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
