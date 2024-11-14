import { Test, TestingModule } from '@nestjs/testing';
import { PersonalAccountService } from '../../application/services/personal-account.service';
import { PersonalAccountController } from './personal-account.controller';

describe('PersonalAccountController', () => {
  let controller: PersonalAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalAccountController],
      providers: [PersonalAccountService],
    }).compile();

    controller = module.get<PersonalAccountController>(
      PersonalAccountController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
