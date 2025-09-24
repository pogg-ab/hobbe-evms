import { ICommand } from '@nestjs/cqrs';
import { UpdateAdminUserAccountDto } from 'src/presentation/dtos/update-admin-user-account.dto';

export class UpdateAdminUserAccountCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly updateAdminUserAccountDto: UpdateAdminUserAccountDto,
  ) {}
}
