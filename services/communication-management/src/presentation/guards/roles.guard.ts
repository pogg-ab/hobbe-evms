import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class RolesGuard extends JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean {
    const canActivate = super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }

    if (user && !user.roles) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: `User has no roles assigned ${user.user}`,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'No User',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const hasRole = user.roles.some((role) => requiredRoles.includes(role));
    if (!hasRole) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'User does not have the required role',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
