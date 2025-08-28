// In src/presentation/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // --- START OF DEBUGGING LOGS ---
    console.log('--- Permissions Guard ---');
    console.log('Required Permissions:', requiredPermissions);
    console.log('User Permissions from JWT:', user?.permissions);
    // --- END OF DEBUGGING LOGS ---

    if (!user || !user.permissions) {
      console.log('Guard Result: DENY (No user or no permissions on user object)');
      return false;
    }

    const hasPermission = requiredPermissions.every((permission) => user.permissions.includes(permission));

    console.log('Guard Result:', hasPermission ? 'ALLOW' : 'DENY');
    console.log('-------------------------');

    return hasPermission;
  }
}