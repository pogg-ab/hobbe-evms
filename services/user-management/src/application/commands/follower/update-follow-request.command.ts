import { ICommand } from '@nestjs/cqrs';
import { UpdateFollowDto } from 'src/presentation/dtos/update-follow.dto';

export class UpdateFollowRequestCommand implements ICommand {
  constructor(
    public readonly followId: string,
    public readonly updateFollowDto: UpdateFollowDto,
  ) {}
}