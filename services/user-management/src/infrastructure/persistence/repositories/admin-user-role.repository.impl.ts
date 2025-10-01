// src/infrastructure/persistence/repositories/admin-user-role.repository.impl.ts

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUserRole } from 'src/domain/entities/admin-user-role.entity';
import { IAdminUserRoleRepository } from 'src/domain/repositories/admin-user-role.repository';
import { AdminUserRoleID } from 'src/domain/value-objects/admin-user-role-id.value-object';
import { Repository } from 'typeorm';

@Injectable()
export class AdminUserRoleRepositoryImpl implements IAdminUserRoleRepository {
  constructor(
    @InjectRepository(AdminUserRole)
    private readonly adminUserRoleRepository: Repository<AdminUserRole>,
  ) {}

  async findOneByUserIdAndRoleId(
    userId: string,
    roleId: string,
  ): Promise<AdminUserRole | null> {
    return this.adminUserRoleRepository
      .createQueryBuilder('adminUserRole')
      .innerJoinAndSelect('adminUserRole.role', 'role')
      .innerJoinAndSelect('adminUserRole.admin_user_id', 'adminUser')
      .where('adminUser.admin_user_id = :userId', { userId })
      .andWhere('role.role_id = :roleId', { roleId })
      .getOne();
  }

  async create(adminUserRole: AdminUserRole): Promise<AdminUserRole> {
    try {
      const newRole = this.adminUserRoleRepository.create(adminUserRole);
      return await this.adminUserRoleRepository.save(newRole);
    } catch (error) {
      throw new HttpException(
        `Error creating AdminUserRole: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<AdminUserRole[]> {
    try {
      return await this.adminUserRoleRepository.find();
    } catch (error) {
      throw new HttpException(
        `Error fetching AdminUserRoles: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneById(id: AdminUserRoleID): Promise<AdminUserRole | null> {
    try {
      const role = await this.adminUserRoleRepository.findOne({
        where: { admin_user_role_id: id.toString() as any },
      });
      return role || null;
    } catch (error) {
      throw new HttpException(
        `Error fetching AdminUserRole with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: AdminUserRoleID,
    adminUserRole: AdminUserRole,
  ): Promise<AdminUserRole> {
    try {
      const existingRole = await this.findOneById(id);
      if (!existingRole) {
        throw new HttpException(
          `AdminUserRole with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      const updatedRole = Object.assign(existingRole, adminUserRole);
      return await this.adminUserRoleRepository.save(updatedRole);
    } catch (error) {
      throw new HttpException(
        `Error updating AdminUserRole: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: AdminUserRoleID): Promise<void> {
    try {
      const roleToDelete = await this.findOneById(id);
      if (!roleToDelete) {
        throw new HttpException(
          `AdminUserRole with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      await this.adminUserRoleRepository.remove(roleToDelete);
    } catch (error) {
      throw new HttpException(
        `Error deleting AdminUserRole: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
