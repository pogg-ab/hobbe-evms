import { PersonalAccount } from '../entities/personal-account.entity';

export interface IPersonalAccountRepository {
  create(personalAccount: PersonalAccount): Promise<PersonalAccount>;
  findAll(): Promise<PersonalAccount[]>;
  findOneById(id: string): Promise<PersonalAccount | null>;
  update(
    id: string,
    personalAccount: PersonalAccount,
  ): Promise<PersonalAccount>;
  delete(id: string): Promise<void>;
}
