import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/domain/entities/user-role.entity';
import { IUserRoleRepository } from 'src/domain/repositories/user-role.repository';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserRoleRepositoryImpl implements IUserRoleRepository {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) { }

  async create(manager: EntityManager, userRole: UserRole): Promise<UserRole> {
    try {
      const newUserRole = this.userRoleRepository.create(userRole);
      return await manager.save(newUserRole);
    } catch (error) {
      throw new HttpException(
        `Error creating UserRole: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
