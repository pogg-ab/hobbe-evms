import { ICommand } from '@nestjs/cqrs';
import { UserID } from 'src/domain/value-objects/user-id.value-object';
import { UpdateUserDto } from 'src/presentation/dtos/update-user.dto';

export class UpdateUserCommand implements ICommand {
    constructor(
        public readonly userId: UserID,
        public readonly updateUserDto: UpdateUserDto,
    ) { }
}
