import { Test, TestingModule } from '@nestjs/testing';
import { TicketsGiftController } from './tickets-gift.controller';

describe('TicketsGiftController', () => {
  let controller: TicketsGiftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsGiftController],
    }).compile();

    controller = module.get<TicketsGiftController>(TicketsGiftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
