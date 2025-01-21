import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { IAdminUserAccountRepository } from 'src/domain/repositories/admin-user-account.repository';
import { AdminUserAccountID } from 'src/domain/value-objects/admin-user-account-id.value-object';
import { Repository } from 'typeorm';

@Injectable()
export class AdminUserAccountRepositoryImpl
  implements IAdminUserAccountRepository
{
  constructor(
    @InjectRepository(AdminUserAccount)
    private readonly adminUserAccountRepository: Repository<AdminUserAccount>,
  ) {}

  async create(adminUserAccount: AdminUserAccount): Promise<AdminUserAccount> {
    return this.adminUserAccountRepository.save(adminUserAccount);
  }

  async findAll(): Promise<AdminUserAccount[]> {
    return this.adminUserAccountRepository.find();
  }

  async findOneById(id: AdminUserAccountID): Promise<AdminUserAccount | null> {
    return this.adminUserAccountRepository.findOne({
      where: { admin_user_account_id: id.toString() },
    });
  }

  async update(
    id: AdminUserAccountID,
    adminUserAccount: AdminUserAccount,
  ): Promise<AdminUserAccount> {
    const existingAccount = await this.findOneById(id);
    if (!existingAccount) {
      throw new Error(`AdminUserAccount with ID ${id.toString()} not found`);
    }

    Object.assign(existingAccount, adminUserAccount);

    return this.adminUserAccountRepository.save(existingAccount);
  }

  async delete(id: AdminUserAccountID): Promise<void> {
    const existingAccount = await this.findOneById(id);
    if (!existingAccount) {
      throw new Error(`AdminUserAccount with ID ${id.toString()} not found`);
    }

    await this.adminUserAccountRepository.delete(id.toString());
  }
}
