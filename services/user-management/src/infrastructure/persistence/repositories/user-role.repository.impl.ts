import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/domain/entities/user-role.entity';
import { IUserRoleRepository } from 'src/domain/repositories/user-role.repository';
import { Repository } from 'typeorm';

@Injectable()
export class UserRoleRepositoryImpl implements IUserRoleRepository {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async create(userRole: UserRole): Promise<UserRole> {
    try {
      const newUserRole = this.userRoleRepository.create(userRole);
      return await this.userRoleRepository.save(newUserRole);
    } catch (error) {
      throw new HttpException(
        `Error creating UserRole: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
