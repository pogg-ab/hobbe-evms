import { EntityManager } from 'typeorm';
import { GroupAccount } from '../entities/group-account.entity';

export interface IGroupAccountRepository {
  create(
    manager: EntityManager,
    groupAccount: GroupAccount,
  ): Promise<GroupAccount>;
  findById(id: string): Promise<GroupAccount | null>;
  findAllByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    groupAccounts: GroupAccount[] | null;
    total: number;
    page: number;
    limit: number;
  }>;
  delete(id: string): Promise<void>;
  findByPrimaryAndLinked(
    primaryUserId: string,
    linkedUserId: string,
  ): Promise<GroupAccount | null>;
}
