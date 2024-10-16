import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { User } from 'src/domain/entities/user.entity';
import { UserCreatedEvent } from 'src/domain/events/user-created.event';
import { CreateUserCommand } from '../commands/create-user.command';
import { DeleteUserCommand } from '../commands/delete-user.command';
import { UpdateUserCommand } from '../commands/update-user.command';
import { CreateUserHandler } from '../handlers/create-user.handler';
import { DeleteUserHandler } from '../handlers/delete-user.handler';
import { GetAllUsersHandler } from '../handlers/get-all-users.handler';
import { GetUserByIdHandler } from '../handlers/get-user-by-id.handler';
import { UpdateUserHandler } from '../handlers/update-user.handler';
import { GetAllUsersQuery } from '../queries/get-all-users.query';
import { GetUserByIdQuery } from '../queries/get-user-by-id.query';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserHandler: CreateUserHandler,
    private readonly updateUserHandler: UpdateUserHandler,
    private readonly getAllUsersHandler: GetAllUsersHandler,
    private readonly getUserByIdHandler: GetUserByIdHandler,
    private readonly deleteUserHandler: DeleteUserHandler,
    @Inject('EVENT_SERVICE') private readonly eventClient: ClientKafka,
  ) {}

  async create(command: CreateUserCommand): Promise<User> {
    const user = await this.createUserHandler.execute(command);
    const event = new UserCreatedEvent(
      user.id,
      user.name,
      user.email,
      user.phoneNumber,
      {
        street: 'test',
        city: 'test',
        state: 'test',
        postalCode: 'test',
      },
    );
    await this.eventClient.emit('user_created', event);
    return user;
  }

  async findAll(query: GetAllUsersQuery): Promise<User[]> {
    return this.getAllUsersHandler.execute(query);
  }

  async findOne(query: GetUserByIdQuery): Promise<User | null> {
    return this.getUserByIdHandler.execute(query);
  }

  async update(id: string, command: UpdateUserCommand): Promise<User> {
    const user = await this.updateUserHandler.execute(id, command);
    await this.eventClient.emit('user_updated', user);
    return user;
  }

  async remove(command: DeleteUserCommand): Promise<void> {
    return this.deleteUserHandler.execute(command);
  }
}
