// permissions.guard.ts
import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionCheckingService } from 'src/application/services/permissions-checking/permission-checking.service';
import { UniversalAuthGuard } from './universal-auth.guard';

@Injectable()
export class PermissionsGuard extends UniversalAuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionCheckingService: PermissionCheckingService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const canActivate = await super.canActivate(context);
        if (!canActivate) {
            return false;
        }

        const request = context.switchToHttp().getRequest();

        const user = request.user;
        const requiredPermissions = this.reflector.get<string[]>(
            PERMISSIONS_KEY,
            context.getHandler(),
        );

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        if (!user) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.FORBIDDEN,
                    message: 'No authenticated user',
                },
                HttpStatus.FORBIDDEN,
            );
        }

        if (user.permissions) {
            const hasAllPermissions = requiredPermissions.every(permission =>
                user.permissions.includes(permission)
            );

            if (hasAllPermissions) {
                return true;
            }
        }

        if (user.roles) {
            if (!user.roles || !Array.isArray(user.roles)) {
                throw new HttpException(
                    {
                        statusCode: HttpStatus.FORBIDDEN,
                        message: 'User has no roles assigned',
                    },
                    HttpStatus.FORBIDDEN,
                );
            }

            for (const role of user.roles) {
                try {
                    const hasPermissions = await this.permissionCheckingService.checkPermissions(
                        role,
                        requiredPermissions
                    );

                    if (hasPermissions) {
                        return true;
                    }
                } catch (error) {
                    console.error(`Permission check failed for role ${role}:`, error);
                }
            }
        }

        throw new HttpException(
            {
                statusCode: HttpStatus.FORBIDDEN,
                message: `User does not have the required permissions: ${requiredPermissions.join(', ')}`,
            },
            HttpStatus.FORBIDDEN,
        );
    }
}