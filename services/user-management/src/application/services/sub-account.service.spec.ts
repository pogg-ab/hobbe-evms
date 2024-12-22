import { Test, TestingModule } from '@nestjs/testing';
import { SubAccountService } from './sub-account.service';

describe('SubAccountService', () => {
  let service: SubAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubAccountService],
    }).compile();

    service = module.get<SubAccountService>(SubAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
