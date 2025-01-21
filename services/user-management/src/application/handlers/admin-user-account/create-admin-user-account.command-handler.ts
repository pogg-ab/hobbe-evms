import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AdminUserAccountService } from 'src/application/services/admin-user-account.service';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { CreateAdminUserAccountCommand } from '../../commands/admin-user-account/create-admin-user-account.command';

@CommandHandler(CreateAdminUserAccountCommand)
export class CreateAdminUserAccountCommandHandler
  implements ICommandHandler<CreateAdminUserAccountCommand>
{
  constructor(
    private readonly adminUserAccountService: AdminUserAccountService,
  ) {}

  async execute(
    command: CreateAdminUserAccountCommand,
  ): Promise<AdminUserAccount> {
    const { createAdminUserAccountDto } = command;
    return this.adminUserAccountService.create(createAdminUserAccountDto);
  }
}
