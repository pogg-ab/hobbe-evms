import { Inject } from '@nestjs/common';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { GetAllUsersQuery } from '../queries/get-all-users.query';

export class GetAllUsersHandler {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}
  async execute(query: GetAllUsersQuery): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
