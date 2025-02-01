import { ICommand } from '@nestjs/cqrs';
import { UpdateUserDto } from 'src/presentation/dtos/update-user.dto';

export class UpdateUserCommand implements ICommand {
    constructor(
        public readonly userId: string,
        public readonly updateUserDto: UpdateUserDto,
    ) { }
}
