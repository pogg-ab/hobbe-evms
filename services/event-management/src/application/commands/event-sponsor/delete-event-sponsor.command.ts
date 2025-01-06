import { ICommand } from '@nestjs/cqrs';

export class DeleteEventSponsorCommand implements ICommand {
  constructor(public readonly id: string) {}
}
