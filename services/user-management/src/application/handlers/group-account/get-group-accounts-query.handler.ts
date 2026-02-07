// src/application/handlers/group-account/get-group-accounts.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupAccount } from 'src/domain/entities/group-account.entity';
import { GroupAccountService } from 'src/application/services/group-account.service';
import { GetGroupAccountsQuery } from 'src/application/queries/group-account/get-group-accounts.query';

@QueryHandler(GetGroupAccountsQuery)
export class GetGroupAccountsQueryHandler
    implements IQueryHandler<GetGroupAccountsQuery> {
    constructor(private readonly groupAccountService: GroupAccountService) { }

    async execute(query: GetGroupAccountsQuery): Promise<{
        groupAccounts: GroupAccount[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        const { userId, page, limit } = query;
        return this.groupAccountService.findGroupAccountsByUserId(userId, page, limit);
    }
}