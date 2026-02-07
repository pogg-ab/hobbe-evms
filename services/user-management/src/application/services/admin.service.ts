import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUserRole } from 'src/domain/entities/admin-user-role.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { Permission } from 'src/domain/entities/permission.entity';
import { RolePermission } from 'src/domain/entities/role-permission.entity';
import { Role } from 'src/domain/entities/role.entity';
import { IRoleRepository } from 'src/domain/repositories/role.repository';
import { ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/role.repository.token';
import { CreatePermissionDto } from 'src/presentation/dtos/create-permission.dto';
import { CreateRoleDto } from 'src/presentation/dtos/create-role.dto';
import { UpdatePermissionDto } from 'src/presentation/dtos/update-permission.dto';
import { UpdateRoleDto } from 'src/presentation/dtos/update-role.dto';
import { In, Repository } from 'typeorm';

@Injectable()
export class AdminService {
  roleTypeOrmRepository: any;
  constructor(
    @Inject(ROLE_REPOSITORY_TOKEN)
    private readonly roleRepository: IRoleRepository,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AdminUserRole)
    private readonly adminUserRoleRepository: Repository<AdminUserRole>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  // --- CORRECTED 'create' METHOD ---
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description, permissions: permissionIds } = createRoleDto;

    const roleToCreate = this.mapper.map(
      { name, description },
      CreateRoleDto,
      Role,
    );

    try {
      const savedRole = await this.roleRepository.create(roleToCreate);

      if (permissionIds && permissionIds.length > 0) {
        const existingPermissions = await this.permissionRepository.findBy({
          permission_id: In(permissionIds),
        });

        if (existingPermissions.length !== permissionIds.length) {
          throw new HttpException(
            'One or more of the provided permission IDs do not exist.',
            HttpStatus.BAD_REQUEST,
          );
        }

        const linksToCreate = existingPermissions.map((permission) => {
          return this.rolePermissionRepository.create({
            role: savedRole,
            permission: permission,
          });
        });

        await this.rolePermissionRepository.save(linksToCreate);
      }

      return savedRole;
    } catch (error) {
      if (error.code === '23505') {
        throw new HttpException(
          `Error creating Role: A role with the name '${name}' already exists.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
    });
  }

  async findOneById(id: string): Promise<Role> {
    return this.roleRepository.findOneById(id);
  }
  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { name, description, permissions: permissionIds } = updateRoleDto;

    const roleToUpdate = await this.roleRepository.findOneById(id);
    if (!roleToUpdate) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    roleToUpdate.name = name ?? roleToUpdate.name;
    roleToUpdate.description = description ?? roleToUpdate.description;
    await this.roleRepository.update(id, roleToUpdate);

    if (permissionIds !== undefined) {
      await this.rolePermissionRepository.delete({ role: { role_id: id } });

      if (permissionIds.length > 0) {
        const newPermissions = await this.permissionRepository.findBy({
          permission_id: In(permissionIds),
        });

        if (newPermissions.length !== permissionIds.length) {
          throw new HttpException(
            'One or more provided permission IDs do not exist.',
            HttpStatus.BAD_REQUEST,
          );
        }

        const newLinks = newPermissions.map((permission) => {
          return this.rolePermissionRepository.create({
            role: roleToUpdate,
            permission: permission,
          });
        });

        await this.rolePermissionRepository.save(newLinks);
      }
    }

    return this.roleRepository.findOneById(id);
  }

  async deleteRole(id: string): Promise<void> {
    await this.roleRepository.delete(id);
  }

  async assignRoleToUser(
    userId: string,
    roleId: string,
  ): Promise<AdminUserRole> {
    const adminUser = await this.adminUserRepository.findOneBy({
      admin_user_id: userId,
    });
    if (!adminUser) {
      throw new NotFoundException(`Admin user with ID "${userId}" not found`);
    }

    const role = await this.roleRepository.findOneById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    const existingLink = await this.adminUserRoleRepository.findOne({
      where: { admin_user_id: userId as any, role: { role_id: roleId } },
      relations: ['role'],
    });

    if (existingLink) {
      throw new HttpException(
        'User already has this role.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const adminUserRoleLink = this.adminUserRoleRepository.create({
      admin_user_id: userId as any,
      role: role,
    });

    return this.adminUserRoleRepository.save(adminUserRoleLink);
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

  async checkRolePermissions(
    payload: any,
  ): Promise<{ hasPermissions: boolean; missingPermissions?: string[] }> {
    const { role, requiredPermissions } = payload;

    if (!role) {
      throw new HttpException('Role is required', HttpStatus.BAD_REQUEST);
    }

    if (
      !requiredPermissions ||
      !Array.isArray(requiredPermissions) ||
      requiredPermissions.length === 0
    ) {
      throw new HttpException(
        'Required permissions array is required and cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const roles = await this.roleRepository.find({
        where: { name: role },
        relations: ['rolePermissions', 'rolePermissions.permission'],
      });

      if (!roles || roles.length === 0) {
        throw new HttpException(
          `Role '${role}' not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const roleEntity = roles[0];

      const rolePermissionNames = roleEntity.rolePermissions.map(
        (rp) => rp.permission.action,
      );

      const missingPermissions = requiredPermissions.filter(
        (requiredPerm) => !rolePermissionNames.includes(requiredPerm),
      );

      const hasAllPermissions = missingPermissions.length === 0;

      return {
        hasPermissions: hasAllPermissions,
        ...(hasAllPermissions ? {} : { missingPermissions }),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error checking permissions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
