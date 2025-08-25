import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { AdminUserRole } from 'src/domain/entities/admin-user-role.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
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
import { MessageProducerService } from 'src/infrastructure/kafka/message.producer.service';
import { AssignRoleDto } from 'src/presentation/dtos/assign-role.dto';
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
    @Inject(ADMIN_USER_ROLE_REPOSITORY_TOKEN)
    private readonly adminUserRoleRepository: IAdminUserRoleRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly messageProducerService: MessageProducerService,
  ) {}

  generateRandomPassword(): string {
    const length = 6;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

// Inside the AdminUserAccountService class...

async create(createAdminUserAccountDto: CreateAdminUserAccountDto): Promise<AdminUserAccount | { success: boolean; message: string }> {
    // This part of your code remains the same
    const newAccount = this.mapper.map(createAdminUserAccountDto, CreateAdminUserAccountDto, AdminUserAccount);
    const savedAccount = await this.adminUserAccountRepository.create(newAccount);
    
    const adminUser = this.mapper.map(createAdminUserAccountDto, CreateAdminUserAccountDto, AdminUser);
    const generatedPassword = this.generateRandomPassword();
    adminUser.password = await this.hashPassword(generatedPassword);
    adminUser.admin_user_account = savedAccount.admin_user_account_id;
    const newAdminUser = await this.adminUserRepository.create(adminUser);

    // --- THIS IS THE CORRECTED LOGIC ---
    // The old logic for getting the 'Admin' role is removed.
    // We now iterate through the roleIds provided in the DTO using a for...of loop.

    for (const roleId of createAdminUserAccountDto.roleIds) {
      const adminUserRole = new AdminUserRole();
      adminUserRole.admin_user_id = newAdminUser.admin_user_id;
      adminUserRole.role = { role_id: roleId } as Role; // Type assertion to satisfy the relation

      // This calls the existing 'create' method on your repository for each role.
      await this.adminUserRoleRepository.create(adminUserRole);
    }
    // --- END OF CORRECTED LOGIC ---

    // This part of your code remains the same
    const emailPayload = this.createPasswordEmail(createAdminUserAccountDto.emailAddress, generatedPassword);
    try {
      await this.messageProducerService.sendEmailToKafka(emailPayload);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return { success: false, message: 'Failed to send password email.' };
    }

    return savedAccount;
}

  // --- THIS IS THE NEW, CORRECTED METHOD ---
  async assignRoleToUser(userId: string, assignRoleDto: AssignRoleDto): Promise<AdminUserRole> {
    const { roleId, membershipRole } = assignRoleDto;

    const adminUser = await this.adminUserRepository.findOneById(userId as any);
    if (!adminUser) {
      throw new NotFoundException(`Admin user with ID "${userId}" not found`);
    }

    const role = await this.roleRepository.findOneById(roleId as any);
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }
    
    const existingLink = await this.adminUserRoleRepository.findOneByUserIdAndRoleId(userId, roleId);
    if (existingLink) {
      throw new HttpException('User already has this role.', HttpStatus.BAD_REQUEST);
    }

    const adminUserRole = new AdminUserRole();
    adminUserRole.admin_user_id = adminUser.admin_user_id;
    adminUserRole.role = role;
    
    if (membershipRole) {
      adminUserRole.membershipRole = membershipRole;
    }

    return this.adminUserRoleRepository.create(adminUserRole);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  private createPasswordEmail(recipient: string, generatedPassword: string): any {
    const email = {
      recipient: recipient,
      subject: 'Your Generated User Account Password from Hobbe EVMS',
      body: generatedPassword,
      created_at: new Date(),
      updated_at: new Date(),
      sent_at: null,
    };
    return email;
  }

  private async getRoleByName(roleName: string): Promise<Role> {
    try {
      const role = await this.roleRepository.findOneBy({ name: roleName });
      if (!role) {
        throw new HttpException(`Role ${roleName} not found`, HttpStatus.NOT_FOUND);
      }
      return role;
    } catch (error) {
      throw new HttpException(`Error fetching role: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
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

  async update(id: AdminUserAccountID, updateAdminUserAccountDto: UpdateAdminUserAccountDto): Promise<AdminUserAccount> {
    const account = await this.findOne(id);
    const updatedAccount = this.mapper.map(updateAdminUserAccountDto, UpdateAdminUserAccountDto, AdminUserAccount);
    await this.adminUserAccountRepository.update(id, updatedAccount);
    return updatedAccount;
  }

  // Inside AdminUserAccountService

// Inside AdminUserAccountService

async deleteAdminUserAccount(id: AdminUserAccountID): Promise<void> {
    // 1. Find the AdminUser login record linked to this account ID.
    // We must use the custom repository method we built.
    const adminUser = await this.adminUserRepository.findOneByAccountId(id);

    // 2. If a login record exists, it MUST be deleted first.
    if (adminUser) {
      await this.adminUserRepository.delete(adminUser.admin_user_id);
    }

    // 3. Now it is safe to delete the main account record.
    // The handler's `remove` command already calls `findOne` to check if the account exists,
    // so we can proceed directly to delete.
    await this.adminUserAccountRepository.delete(id);
  }
}