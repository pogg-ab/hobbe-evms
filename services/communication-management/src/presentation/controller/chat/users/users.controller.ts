import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserService } from 'src/application/services/chat/users/users.service';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}


  @ApiOperation({ description: 'Create a new User' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('open-account')
  async createUser(
    @CurrentUserId() user: any,
  ) {
    const newUser = {
      username: user.user.user_name,
      account_type: user.user.account_type,
      is_active: user.user.is_active,
    };
    // return await newUser;
    await this.userService.createUser(user.user.user_id.toString(), newUser);
    return { message: 'User created successfully' };
  }

  @ApiOperation({ description: 'Get User Data' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my-account')
  async getChat( @CurrentUserId() user: any,) {
    const userData = await this.userService.getUser(user.user.user_id.toString());
    return userData ? userData : { message: 'No user found for this ID' };
  }
}
