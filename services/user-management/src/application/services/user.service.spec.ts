import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { NotFoundException } from '@nestjs/common';
import { User } from 'src/domain/entities/user.entity';
import { AccountType } from 'src/domain/value-objects/account-type.value-object';
import { PersonalAccountID } from 'src/domain/value-objects/personal-account-id.value-object';
import { UserID } from 'src/domain/value-objects/user-id.value-object';
import { OrganizationalAccountID } from 'src/domain/value-objects/organizational-account-id.value-object';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';

const mockUserRepository = {
    findByIdWithAccountInfo: jest.fn(),
    findAllUsers: jest.fn(),
};

describe('UserService', () => {
    let userService: UserService;
    let userRepository: IUserRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: USER_REPOSITORY_TOKEN,
                    useClass: UserRepositoryImpl,
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        userService = module.get<UserService>(UserService);
        userRepository = module.get<IUserRepository>(USER_REPOSITORY_TOKEN);
    });

    it('should be defined', () => {
        expect(userService).toBeDefined();
    });

    describe('findUserById', () => {
        it('should return a user when found', async () => {
            const mockUser: any = {
                user_id: new UserID,
                user_name: 'John Doe',
                account_type: AccountType.PERSONAL,
                personal_account: new PersonalAccountID,
                organizational_account: new OrganizationalAccountID,
            };
            mockUserRepository.findByIdWithAccountInfo.mockResolvedValue(mockUser);

            const user = await userService.findUserById('1');
            expect(user).toEqual(mockUser);
            expect(mockUserRepository.findByIdWithAccountInfo).toHaveBeenCalledWith('1');
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUserRepository.findByIdWithAccountInfo.mockResolvedValue(null);

            try {
                await userService.findUserById('999');
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
                expect(error.message).toBe('User with ID 999 not found');
            }
        });
    });

    describe('findAllUsers', () => {
        it('should return an array of users', async () => {
            const mockUsers: any[] = [
                { user_id: '1', user_name: 'John Doe', account_type: 'personal', personal_account: { account_info: 'Data' }, organizational_account: null },
            ];
            mockUserRepository.findAllUsers.mockResolvedValue(mockUsers);

            const users = await userService.findAllUsers();
            expect(users).toEqual(mockUsers);
            expect(mockUserRepository.findAllUsers).toHaveBeenCalled();
        });

        it('should return null if no users found', async () => {
            mockUserRepository.findAllUsers.mockResolvedValue(null);

            const users = await userService.findAllUsers();
            expect(users).toBeNull();
        });
    });
});
