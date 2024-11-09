import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/domain/entities/role.entity';
import { IRoleRepository } from 'src/domain/repositories/role.repository';
import { Repository } from 'typeorm';

@Injectable()
export class RoleRepositoryImpl implements IRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(role: Role): Promise<Role> {
    try {
      const newRole = this.roleRepository.create(role);
      return await this.roleRepository.save(newRole);
    } catch (error) {
      throw new HttpException(
        `Error creating Role: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async find(): Promise<Role[]> {
    try {
      return await this.roleRepository.find();
    } catch (error) {
      throw new HttpException(
        `Error fetching roles: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ role_id: id });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: string, updatedRole: Partial<Role>): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ role_id: id });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    Object.assign(role, updatedRole);
    return await this.roleRepository.save(role);
  }

  async delete(id: string): Promise<void> {
    const result = await this.roleRepository.delete({ role_id: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
  }
}
