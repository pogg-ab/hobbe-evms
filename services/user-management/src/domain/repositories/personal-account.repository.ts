import { PersonalAccount } from '../entities/personal-account.entity';
import { PersonalAccountID } from '../value-objects/personal-account-id.value-object';

export interface IPersonalAccountRepository {
  create(personalAccount: PersonalAccount): Promise<PersonalAccount>;
  findAll(): Promise<PersonalAccount[]>;
  findOneById(id: PersonalAccountID): Promise<PersonalAccount | null>;
  update(
    id: PersonalAccountID,
    personalAccount: PersonalAccount,
  ): Promise<PersonalAccount>;
  delete(id: PersonalAccountID): Promise<void>;
  sendEmailVerificationDb(user_name: string): Promise<any>;
  findByEmail(email: string): Promise<PersonalAccount | null>;
}
