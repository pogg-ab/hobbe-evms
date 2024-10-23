import { PersonalAccount } from '../entities/personal-account.entity';

export interface IPersonalAccountRepository {
  create(personalAccount: PersonalAccount): Promise<PersonalAccount>;
}
