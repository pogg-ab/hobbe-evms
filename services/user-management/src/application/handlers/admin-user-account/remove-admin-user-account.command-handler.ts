import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AdminUserAccountService } from 'src/application/services/admin-user-account.service';
import { RemoveAdminUserAccountCommand } from '../../commands/admin-user-account/remove-admin-user-account.command';

@CommandHandler(RemoveAdminUserAccountCommand)
export class RemoveAdminUserAccountCommandHandler
  implements ICommandHandler<RemoveAdminUserAccountCommand>
{
  constructor(
    private readonly adminUserAccountService: AdminUserAccountService,
  ) {}

  async execute(command: RemoveAdminUserAccountCommand): Promise<void> {
    const { id } = command;
    return this.adminUserAccountService.deleteAdminUserAccount(id);
  }
}
