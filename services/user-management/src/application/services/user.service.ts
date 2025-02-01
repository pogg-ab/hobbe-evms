import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { UpdateUserDto } from 'src/presentation/dtos/update-user.dto';

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

    async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
        const existingUser = await this.findUserById(userId);

        if (!existingUser) {
            throw new HttpException(
                `User with ID ${userId} not found`,
                HttpStatus.NOT_FOUND,
            );
        }

        const updatedUser = Object.assign(existingUser, updateUserDto);

        return await this.userRepository.update(updatedUser);
    }


}
