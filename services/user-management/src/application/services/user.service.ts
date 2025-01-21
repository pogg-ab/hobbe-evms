import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';

@Injectable()
export class UserService {
    constructor(
        @Inject(USER_REPOSITORY_TOKEN)
        private readonly userRepository: IUserRepository,
    ) { }


    async findUserById(userId: string): Promise<User> {
        const user = await this.userRepository.findByIdWithAccountInfo(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        return user;
    }

    async findAllUsers(): Promise<any | null> {
        return await this.userRepository.findAllUsers();
    }


}
