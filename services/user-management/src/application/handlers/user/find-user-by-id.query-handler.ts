import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserService } from 'src/application/services/user.service';
import { FindUserByIdQuery } from 'src/application/queries/user/find-user-by-id.query';
import { User } from 'src/domain/entities/user.entity';

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdQueryHandler
    implements IQueryHandler<FindUserByIdQuery> {
    constructor(private readonly userService: UserService) { }

    async execute(query: FindUserByIdQuery): Promise<User> {
        return this.userService.findUserById(query.userId);
    }
}
