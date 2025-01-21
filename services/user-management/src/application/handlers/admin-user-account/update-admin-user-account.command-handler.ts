import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AdminUserAccountService } from 'src/application/services/admin-user-account.service';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { UpdateAdminUserAccountCommand } from '../../commands/admin-user-account/update-admin-user-account.command';

@CommandHandler(UpdateAdminUserAccountCommand)
export class UpdateAdminUserAccountCommandHandler
  implements ICommandHandler<UpdateAdminUserAccountCommand>
{
  constructor(
    private readonly adminUserAccountService: AdminUserAccountService,
  ) {}

  async execute(
    command: UpdateAdminUserAccountCommand,
  ): Promise<AdminUserAccount> {
    const { id, updateAdminUserAccountDto } = command;
    return this.adminUserAccountService.update(id, updateAdminUserAccountDto);
  }
}
