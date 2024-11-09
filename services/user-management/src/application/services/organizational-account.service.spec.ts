import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationalAccountService } from './organizational-account.service';

describe('OrganizationalAccountService', () => {
  let service: OrganizationalAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationalAccountService],
    }).compile();

    service = module.get<OrganizationalAccountService>(OrganizationalAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
