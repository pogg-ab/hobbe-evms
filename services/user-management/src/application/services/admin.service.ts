// src/admin/admin.service.ts
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/domain/entities/permission.entity';
import { RolePermission } from 'src/domain/entities/role-permission.entity';
import { Role } from 'src/domain/entities/role.entity';
import { IRoleRepository } from 'src/domain/repositories/role.repository';
import { CreatePermissionDto } from 'src/presentation/dtos/create-permission.dto';
import { CreateRoleDto } from 'src/presentation/dtos/create-role.dto';
import { UpdatePermissionDto } from 'src/presentation/dtos/update-permission.dto';
import { UpdateRoleDto } from 'src/presentation/dtos/update-role.dto';
import { In, Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: IRoleRepository,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async addRole(createRoleDto: CreateRoleDto): Promise<Role> {
    let existingPermissions: Permission[] = [];
    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      const count = await this.permissionRepository.count({
        where: {
          permission_id: In(createRoleDto.permissions),
        },
      });

      if (count !== createRoleDto.permissions.length) {
        throw new HttpException(
          'Some permissions do not exist.',
          HttpStatus.BAD_REQUEST,
        );
      }

      existingPermissions = await this.permissionRepository.findBy({
        permission_id: In(createRoleDto.permissions),
      });
    }

    const role = this.mapper.map(createRoleDto, CreateRoleDto, Role);

    const createRole = await this.roleRepository.create(role);
    const rolePermissions = existingPermissions.map((permission) => {
      const rolePermission = new RolePermission();
      rolePermission.role = createRole.role_id;
      rolePermission.permission = permission.permission_id;
      return rolePermission;
    });
    const rolePermission =
      this.rolePermissionRepository.create(rolePermissions);
    await this.rolePermissionRepository.save(rolePermission);
    return createRole;
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async findOneById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOneById(id);
    return role;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findOneById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    const updatedRole = this.mapper.map(updateRoleDto, UpdateRoleDto, Role);
    return this.roleRepository.update(id, updatedRole);
  }

  async deleteRole(id: string): Promise<void> {
    await this.roleRepository.delete(id);
  }

  async addPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async updatePermission(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.permissionRepository.findOneBy({
      permission_id: id,
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async deletePermission(id: string): Promise<void> {
    const result = await this.permissionRepository.delete({
      permission_id: id,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
  }
}
