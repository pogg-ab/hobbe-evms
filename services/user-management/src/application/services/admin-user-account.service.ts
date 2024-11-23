import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { AdminUserRole } from 'src/domain/entities/admin-user-role.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { Email } from 'src/domain/entities/email.entity';
import { Role } from 'src/domain/entities/role.entity';
import { IAdminUserAccountRepository } from 'src/domain/repositories/admin-user-account.repository';
import { ADMIN_USER_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/admin-user-account.repository.token';
import { IAdminUserRoleRepository } from 'src/domain/repositories/admin-user-role.repository';
import { ADMIN_USER_ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/admin-user-role.repository.token';
import { IAdminUserRepository } from 'src/domain/repositories/admin-user.repository';
import { ADMIN_USER_REPOSITORY_TOKEN } from 'src/domain/repositories/admin-user.repository.token';
import { IRoleRepository } from 'src/domain/repositories/role.repository';
import { ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/role.repository.token';
import { AdminUserAccountID } from 'src/domain/value-objects/admin-user-account-id.value-object';
import { EmailRepositoryImpl } from 'src/infrastructure/persistence/repositories/email.repository.impl';
import { CreateAdminUserAccountDto } from 'src/presentation/dtos/create-admin-user-account.dto';
import { UpdateAdminUserAccountDto } from 'src/presentation/dtos/update-admin-user-account.dto';

@Injectable()
export class AdminUserAccountService {
  constructor(
    @Inject(ADMIN_USER_ACCOUNT_REPOSITORY_TOKEN)
    private readonly adminUserAccountRepository: IAdminUserAccountRepository,
    @Inject(ADMIN_USER_REPOSITORY_TOKEN)
    private readonly adminUserRepository: IAdminUserRepository,
    @Inject(ROLE_REPOSITORY_TOKEN)
    private readonly roleRepository: IRoleRepository,
    private readonly emailRepository: EmailRepositoryImpl,
    @Inject(ADMIN_USER_ROLE_REPOSITORY_TOKEN)
    private readonly adminUserRoleRepository: IAdminUserRoleRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}
  generateRandomPassword(): string {
    const length = 6;
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }

    return password;
  }

  async create(
    createAdminUserAccountDto: CreateAdminUserAccountDto,
  ): Promise<AdminUserAccount> {
    const newAccount = this.mapper.map(
      createAdminUserAccountDto,
      CreateAdminUserAccountDto,
      AdminUserAccount,
    );
    const savedAccount =
      await this.adminUserAccountRepository.create(newAccount);

    const adminUser = this.mapper.map(
      createAdminUserAccountDto,
      CreateAdminUserAccountDto,
      AdminUser,
    );

    const generatedPassword = this.generateRandomPassword();

    adminUser.password = await this.hashPassword(generatedPassword);
    adminUser.admin_user_account = savedAccount.admin_user_account_id;

    const newAdminUser = await this.adminUserRepository.create(adminUser);

    const role = await this.getRoleByName('Admin');

    const adminUserRole = new AdminUserRole();
    adminUserRole.admin_user_id = newAdminUser.admin_user_id;
    adminUserRole.role = role;
    await this.adminUserRoleRepository.create(adminUserRole);

    const emailContent = this.createPasswordEmail(
      createAdminUserAccountDto.emailAddress,
      generatedPassword,
    );
    await this.emailRepository.save(emailContent);

    return savedAccount;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  private createPasswordEmail(
    recipient: string,
    generatedPassword: string,
  ): Email {
    const email = new Email();
    email.recipient = recipient;
    email.subject = 'Your Generated User Account Password from Hobbe EVMS';
    email.body = generatedPassword;
    email.created_at = new Date();
    email.updated_at = new Date();
    email.sent_at = null;
    return email;
  }

  private async getRoleByName(roleName: string): Promise<Role> {
    try {
      const role = await this.roleRepository.findOneBy({ name: roleName });
      if (!role) {
        throw new HttpException(
          `Role ${roleName} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return role;
    } catch (error) {
      throw new HttpException(
        `Error fetching role: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<AdminUserAccount[]> {
    return this.adminUserAccountRepository.findAll();
  }

  async findOne(id: AdminUserAccountID): Promise<AdminUserAccount> {
    const account = await this.adminUserAccountRepository.findOneById(id);
    if (!account) {
      throw new NotFoundException(`Admin user account with ID ${id} not found`);
    }
    return account;
  }

  async update(
    id: AdminUserAccountID,
    updateAdminUserAccountDto: UpdateAdminUserAccountDto,
  ): Promise<AdminUserAccount> {
    const account = await this.findOne(id);
    const updatedAccount = this.mapper.map(
      updateAdminUserAccountDto,
      UpdateAdminUserAccountDto,
      AdminUserAccount,
    );
    await this.adminUserAccountRepository.update(id, updatedAccount);
    return updatedAccount;
  }

  async deleteAdminUserAccount(id: AdminUserAccountID): Promise<void> {
    const account = await this.findOne(id);
    await this.adminUserAccountRepository.delete(id);
  }
}
