import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/domain/entities/role.entity';
import { IRoleRepository } from 'src/domain/repositories/role.repository';
import { FindManyOptions, Repository } from 'typeorm'; // <-- IMPORT FindManyOptions

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

  // --- THIS IS THE CORRECTED METHOD ---
  async find(options?: FindManyOptions<Role>): Promise<Role[]> {
    try {
      // We now pass the optional 'options' object directly to the underlying
      // TypeORM find method. If 'options' is undefined, it works exactly as before.
      return await this.roleRepository.find(options);
    } catch (error) { // Added missing brace
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

  async findOneBy(criteria: { [key: string]: any }): Promise<Role | null> {
    try {
      const role = await this.roleRepository.findOne({ where: criteria });
      return role;
    } catch (error) {
      throw new HttpException(
        `Error fetching role by criteria: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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