import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UserResponseDto } from '../dtos/user-response.dto';
import { FindAllUsersQuery } from 'src/application/queries/user/find-all-users.query';
import { FindUserByIdQuery } from 'src/application/queries/user/find-user-by-id.query';

describe('UserController', () => {
    let userController: UserController;
    let queryBus: QueryBus;

    const mockQueryBus = {
        execute: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: QueryBus,
                    useValue: mockQueryBus,
                },
            ],
        }).compile();

        userController = module.get<UserController>(UserController);
        queryBus = module.get<QueryBus>(QueryBus);
    });

    it('should be defined', () => {
        expect(userController).toBeDefined();
    });

    describe('findUserById', () => {
        it('should return a user by ID', async () => {
            const result: UserResponseDto = { id: '1', name: 'John', email: 'john@example.com' };
            mockQueryBus.execute.mockResolvedValue(result);

            expect(await userController.findUserById('1')).toBe(result);
            expect(mockQueryBus.execute).toHaveBeenCalledWith(new FindUserByIdQuery('1'));
        });

        it('should throw a NotFoundException if user is not found', async () => {
            mockQueryBus.execute.mockResolvedValue(undefined);

            try {
                await userController.findUserById('999');
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundException);
            }
        });
    });

    describe('findAllUsers', () => {
        it('should return an array of users', async () => {
            const result: UserResponseDto[] = [
                { id: '1', name: 'John', email: 'john@example.com' },
            ];
            mockQueryBus.execute.mockResolvedValue(result);

            expect(await userController.findAllUsers()).toBe(result);
            expect(mockQueryBus.execute).toHaveBeenCalledWith(new FindAllUsersQuery());
        });

        it('should return an empty array if no users found', async () => {
            mockQueryBus.execute.mockResolvedValue([]);

            expect(await userController.findAllUsers()).toEqual([]);
            expect(mockQueryBus.execute).toHaveBeenCalledWith(new FindAllUsersQuery());
        });
    });
});
