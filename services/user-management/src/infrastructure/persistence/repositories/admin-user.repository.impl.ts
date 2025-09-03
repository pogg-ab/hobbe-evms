// src/infrastructure/persistence/repositories/admin-user.repository.impl.ts

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { IAdminUserRepository } from 'src/domain/repositories/admin-user.repository';
import { AdminUserAccountID } from 'src/domain/value-objects/admin-user-account-id.value-object';
import { AdminUserID } from 'src/domain/value-objects/admin-user-id.value-object';
import { Repository } from 'typeorm';

@Injectable()
export class AdminUserRepositoryImpl implements IAdminUserRepository {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
  ) {}

  // --- THIS IS THE FINAL CORRECTED METHOD USING QUERY BUILDER ---
  async findOneByAccountId(accountId: AdminUserAccountID): Promise<AdminUser | null> {
    try {
      return await this.adminUserRepository
        .createQueryBuilder('adminUser')
        .where('adminUser.admin_user_account_id = :accountId', { accountId: accountId.toString() })
        .getOne();
    } catch (error) {
      throw new HttpException(
        `Error fetching AdminUser by Account ID ${accountId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // --- END OF NEW METHOD ---

  async create(adminUser: AdminUser): Promise<AdminUser> {
    try {
      const newUser = this.adminUserRepository.create(adminUser);
      return await this.adminUserRepository.save(newUser);
    } catch (error) {
      throw new HttpException(`Error creating AdminUser: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<AdminUser[]> {
    try {
      return await this.adminUserRepository.find();
    } catch (error) {
      throw new HttpException(`Error fetching AdminUsers: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOneById(id: AdminUserID): Promise<AdminUser | null> {
    try {
      const user = await this.adminUserRepository.findOne({
        where: { admin_user_id: id.toString() as any },
      });
      return user || null;
    } catch (error) {
      throw new HttpException(`Error fetching AdminUser with ID ${id}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: AdminUserID, adminUser: AdminUser): Promise<AdminUser> {
    try {
      const existingUser = await this.findOneById(id);
      if (!existingUser) {
        throw new HttpException(`AdminUser with ID ${id} not found`, HttpStatus.NOT_FOUND);
      }
      const updatedUser = Object.assign(existingUser, adminUser);
      return await this.adminUserRepository.save(updatedUser);
    } catch (error) {
      throw new HttpException(`Error updating AdminUser: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: AdminUserID): Promise<void> {
    try {
      const userToDelete = await this.findOneById(id);
      if (!userToDelete) {
        throw new HttpException(`AdminUser with ID ${id} not found`, HttpStatus.NOT_FOUND);
      }
      await this.adminUserRepository.remove(userToDelete);
    } catch (error) {
      throw new HttpException(`Error deleting AdminUser: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}