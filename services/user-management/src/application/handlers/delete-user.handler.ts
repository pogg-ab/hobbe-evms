import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { DeleteUserCommand } from '../commands/delete-user.command';

@Injectable()
export class DeleteUserHandler {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const existingUser = await this.userRepository.findOne(command.id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    await this.userRepository.remove(command.id);
  }
}
