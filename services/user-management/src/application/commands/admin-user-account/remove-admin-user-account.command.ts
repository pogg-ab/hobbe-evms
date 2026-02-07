import { ICommand } from '@nestjs/cqrs';

export class RemoveAdminUserAccountCommand implements ICommand {
  constructor(public readonly id: string) {}
}
