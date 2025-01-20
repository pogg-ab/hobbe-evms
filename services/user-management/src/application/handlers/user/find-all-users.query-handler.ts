import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserService } from 'src/application/services/user.service';
import { FindAllUsersQuery } from 'src/application/queries/user/find-all-users.query';
import { User } from 'src/domain/entities/user.entity';

@QueryHandler(FindAllUsersQuery)
export class FindAllUsersQueryHandler
    implements IQueryHandler<FindAllUsersQuery> {
    constructor(private readonly userService: UserService) { }

    async execute(query: FindAllUsersQuery): Promise<any | null> {
        return this.userService.findAllUsers();
    }
}
