import { Test, TestingModule } from '@nestjs/testing';
import { SubAccountService } from '../../application/services/sub-account.service';
import { SubAccountController } from './sub-account.controller';

describe('SubAccountController', () => {
  let controller: SubAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubAccountController],
      providers: [SubAccountService],
    }).compile();

    controller = module.get<SubAccountController>(SubAccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
