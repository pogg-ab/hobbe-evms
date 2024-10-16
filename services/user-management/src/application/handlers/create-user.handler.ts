import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { CreateUserCommand } from '../commands/create-user.command';

@Injectable()
export class CreateUserHandler {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const user = new User(
      command.name,
      command.email,
      command.phoneNumber,
      command.address,
    );
    return this.userRepository.create(user);
  }
}
