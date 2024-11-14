import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationalAccountService } from '../../application/services/organizational-account.service';
import { OrganizationalAccountController } from './organizational-account.controller';

describe('OrganizationalAccountController', () => {
  let controller: OrganizationalAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationalAccountController],
      providers: [OrganizationalAccountService],
    }).compile();

    controller = module.get<OrganizationalAccountController>(
      OrganizationalAccountController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
