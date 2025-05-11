import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { AdminUserAccountService } from '../../application/services/admin-user-account.service'; // Adjust the import as needed
import { AdminUserAccountController } from './admin-user-account.controller';

describe('AdminUserAccountController', () => {
  let controller: AdminUserAccountController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUserAccountController],
      providers: [
        CommandBus,
        QueryBus,
        // Mocking the dependencies
        {
          provide: AdminUserAccountService,
          useValue: {
            // You can mock the methods of the service as needed
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminUserAccountController>(
      AdminUserAccountController,
    );
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an admin user account', async () => {
      const createAdminUserAccountDto = {
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john.doe@example.com',
        phone_number: '1234567890',
        profile_image: 'profile.jpg',
      };

      const createdAccount = new AdminUserAccount();
      createdAccount.first_name = 'John';
      createdAccount.last_name = 'Doe';
      createdAccount.email_address = 'john.doe@example.com';

      // Mocking the CommandBus execution
      jest.spyOn(commandBus, 'execute').mockResolvedValue(createdAccount);

      const response = await controller.create(createAdminUserAccountDto);

      expect(response.message).toBe('Admin user account created successfully');
      expect(response.account).toEqual(createdAccount);
    });
  });

  describe('findAll', () => {
    it('should return a list of admin user accounts', async () => {
      const adminUserAccounts = [
        new AdminUserAccount(),
        new AdminUserAccount(),
      ];
      // Mocking the QueryBus execution
      jest.spyOn(queryBus, 'execute').mockResolvedValue(adminUserAccounts);

      const response = await controller.findAll();

      expect(response).toEqual(adminUserAccounts);
    });
  });

  describe('findOne', () => {
    it('should return a single admin user account by id', async () => {
      const adminUserAccountId = 'uuid-id';
      const adminUserAccount = new AdminUserAccount();
      adminUserAccount.admin_user_account_id = adminUserAccountId;

      // Mocking the QueryBus execution
      jest.spyOn(queryBus, 'execute').mockResolvedValue(adminUserAccount);

      const response = await controller.findOne(adminUserAccountId);

      expect(response).toEqual(adminUserAccount);
    });
  });

  describe('update', () => {
    it('should update an admin user account', async () => {
      const adminUserAccountId = 'uuid-id';
      const updateDto = { first_name: 'UpdatedName' };
      const updatedAccount = new AdminUserAccount();
      updatedAccount.first_name = 'UpdatedName';

      // Mocking the QueryBus and CommandBus executions
      jest.spyOn(queryBus, 'execute').mockResolvedValue(updatedAccount);
      jest.spyOn(commandBus, 'execute').mockResolvedValue(updatedAccount);

      const response = await controller.update(adminUserAccountId, updateDto);

      expect(response.first_name).toBe('UpdatedName');
    });
  });

  describe('remove', () => {
    it('should delete an admin user account', async () => {
      const adminUserAccountId = 'uuid-id';

      // Mocking the CommandBus execution for removal
      jest.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

      await controller.remove(adminUserAccountId);

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(RemoveAdminUserAccountCommand),
      );
    });
  });
});
