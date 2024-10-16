import { Inject } from '@nestjs/common';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { GetUserByIdQuery } from '../queries/get-user-by-id.query';

export class GetUserByIdHandler {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}
  async execute(query: GetUserByIdQuery): Promise<User | null> {
    return this.userRepository.findOne(query.id);
  }
}
