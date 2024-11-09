import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/domain/entities/permission.entity';
import { IPermissionRepository } from 'src/domain/repositories/permission.repository';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionRepositoryImpl implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(permission: Permission): Promise<Permission> {
    try {
      const newPermission = this.permissionRepository.create(permission);
      return await this.permissionRepository.save(newPermission);
    } catch (error) {
      throw new HttpException(
        `Error creating Permission: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async find(): Promise<Permission[]> {
    try {
      return await this.permissionRepository.find();
    } catch (error) {
      throw new HttpException(
        `Error fetching permissions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOneBy({
      permission_id: id,
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  async update(
    id: string,
    updatedPermission: Partial<Permission>,
  ): Promise<Permission> {
    const permission = await this.permissionRepository.findOneBy({
      permission_id: id,
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    Object.assign(permission, updatedPermission);
    return await this.permissionRepository.save(permission);
  }

  async delete(id: string): Promise<void> {
    const result = await this.permissionRepository.delete({
      permission_id: id,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
  }
}
