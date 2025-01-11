import { ICommand } from '@nestjs/cqrs';
import { CreateFollowDto } from 'src/presentation/dtos/create-follow.dto';

export class CreateFollowCommand implements ICommand {
  constructor(public readonly createFollowDto: CreateFollowDto) { }
}
