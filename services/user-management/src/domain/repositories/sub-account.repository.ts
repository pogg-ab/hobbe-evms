import { SubAccount } from '../entities/sub-account.entity';
import { SubAccountID } from '../value-objects/sub-account-id.value-object';

export interface ISubAccountRepository {
  create(subAccount: SubAccount): Promise<SubAccount>;
  findAll(): Promise<SubAccount[]>;
  findOne(id: SubAccountID): Promise<SubAccount | null>;
  update(id: SubAccountID, subAccount: SubAccount): Promise<SubAccount>;
  delete(id: string): Promise<void>;
  existsBetweenUsers(ownerUserId: string, subAccountUserId: string): Promise<boolean>;
}
