import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PermissionCheckingService {
    private readonly logger = new Logger(PermissionCheckingService.name);

    constructor(
        @Inject('CHECK_PERMISSION_SERVICE') private readonly client: ClientKafka,
    ) { }

    async checkPermissions(role: string, requiredPermissions: string[]): Promise<boolean> {
        if (!role || !requiredPermissions || requiredPermissions.length === 0) {
            return false;
        }

        try {
            const response = await firstValueFrom(
                this.client.send('checkRolePermissions', {
                    role,
                    permissions: requiredPermissions,
                    timestamp: new Date().toISOString(),
                }),
            );

            if (!response || typeof response.hasPermissions !== 'boolean') {
                throw new Error('Invalid response from permission service');
            }

            return response.hasPermissions;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error communicating with permission service: ${error.message}`);
            }
            throw new Error(
                'Error occurred during permission check communication, please check the logs for more details.',
            );
        }
    }
}