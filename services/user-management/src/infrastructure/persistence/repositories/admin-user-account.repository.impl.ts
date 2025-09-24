import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { IAdminUserAccountRepository } from 'src/domain/repositories/admin-user-account.repository';
import { Repository } from 'typeorm';

@Injectable()
export class AdminUserAccountRepositoryImpl
  implements IAdminUserAccountRepository
{
  constructor(
    @InjectRepository(AdminUserAccount)
    private readonly adminUserAccountRepository: Repository<AdminUserAccount>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
  ) {}

  async create(adminUserAccount: AdminUserAccount): Promise<AdminUserAccount> {
    return this.adminUserAccountRepository.save(adminUserAccount);
  }

  async findAll(): Promise<AdminUserAccount[]> {
    return this.adminUserAccountRepository.find();
  }
  async findAllAdminUsers(): Promise<AdminUser[]> {
    return this.adminUserRepository
      .createQueryBuilder('adminUser')
      .select([
        'adminUser.admin_user_id',
        'adminUser.user_name',
        'adminUser.ssoProvider',
        'adminUser.ssoProviderId',
        'adminUser.is_active',
        'adminUser.created_by',
        'adminUser.created_at',
        'adminUser.updated_by',
        'adminUser.updated_at',
      ])
      .leftJoinAndSelect('adminUser.admin_user_account', 'adminUserAccount')
      .getMany();
  }

  async findOneById(id: string): Promise<AdminUserAccount | null> {
    return this.adminUserAccountRepository.findOne({
      where: { admin_user_account_id: id },
    });
  }

  async update(
    id: string,
    adminUserAccount: AdminUserAccount,
  ): Promise<AdminUserAccount> {
    const existingAccount = await this.findOneById(id);
    if (!existingAccount) {
      throw new Error(`AdminUserAccount with ID ${id.toString()} not found`);
    }

    Object.assign(existingAccount, adminUserAccount);

    return this.adminUserAccountRepository.save(existingAccount);
  }

  async delete(id: string): Promise<void> {
    const existingAccount = await this.findOneById(id);
    if (!existingAccount) {
      throw new Error(`AdminUserAccount with ID ${id.toString()} not found`);
    }

    await this.adminUserAccountRepository.delete(id.toString());
  }
}
