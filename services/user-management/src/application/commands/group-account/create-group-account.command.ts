import { ICommand } from '@nestjs/cqrs';
import { CreateGroupAccountDto } from 'src/presentation/dtos/group-account/create-group-account.dto';

export class CreateGroupAccountCommand implements ICommand {
    constructor(
        public readonly createGroupAccountDto: CreateGroupAccountDto,
        public readonly createdBy: string,
    ) { }
}

