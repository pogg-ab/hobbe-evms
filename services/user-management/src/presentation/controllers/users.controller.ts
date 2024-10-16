import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserCommand } from 'src/application/commands/create-user.command';
import { DeleteUserCommand } from 'src/application/commands/delete-user.command';
import { UpdateUserCommand } from 'src/application/commands/update-user.command';
import { GetAllUsersQuery } from 'src/application/queries/get-all-users.query';
import { GetUserByIdQuery } from 'src/application/queries/get-user-by-id.query';
import { UsersService } from 'src/application/services/users.service';
import { CreateUserDto } from 'src/presentation/dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body() createUserDto: CreateUserDto) {
    const command = new CreateUserCommand(
      createUserDto.name,
      createUserDto.email,
      createUserDto.phoneNumber,
      createUserDto.address,
    );
    return this.usersService.create(command);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users.' })
  async findAll() {
    const query = new GetAllUsersQuery();
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User details.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id') id: string) {
    const query = new GetUserByIdQuery(id);
    return this.usersService.findOne(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const command = new UpdateUserCommand(
      updateUserDto.name,
      updateUserDto.email,
      updateUserDto.phoneNumber,
      updateUserDto.address,
    );
    return this.usersService.update(id, command);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async remove(@Param('id') id: string) {
    const command = new DeleteUserCommand(id);
    return this.usersService.remove(command);
  }
}
