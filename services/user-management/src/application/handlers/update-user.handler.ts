import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { UpdateUserCommand } from '../commands/update-user.command';

@Injectable()
export class UpdateUserHandler {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, command: UpdateUserCommand): Promise<User> {
    const existingUser = await this.userRepository.findOne(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser = new User(
      command.name ?? existingUser.name,
      command.email ?? existingUser.email,
      command.phoneNumber ?? existingUser.phoneNumber,
      command.address ?? existingUser.address,
    );

    return this.userRepository.update(id, updatedUser);
  }
}
