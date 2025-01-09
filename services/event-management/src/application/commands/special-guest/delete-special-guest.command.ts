import { ICommand } from '@nestjs/cqrs';

export class DeleteSpecialGuestCommand implements ICommand {
  constructor(public readonly id: string) {}
}
