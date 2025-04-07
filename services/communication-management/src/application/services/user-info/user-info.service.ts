import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserInfoService {
    private readonly logger = new Logger(UserInfoService.name);

    constructor(
        @Inject('KAFKA_USER_SERVICE') private readonly kafkaClient: ClientKafka,
    ) { }

    async getUserInfo(userIds: string[]): Promise<Record<string, any>> {
        try {
            if (!userIds || userIds.length === 0) {
                return {};
            }

            const response = await firstValueFrom(
                this.kafkaClient.send('get-user-info', { userIds }),
            );

            if (!response || typeof response !== 'object') {
                throw new Error('Invalid response format from user service');
            }

            return response;
        } catch (error) {
            console.error('Error fetching user info via Kafka:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to fetch user info: ${error.message}`);
            }
            throw new Error(
                'Unexpected error occurred while fetching user information',
            );
        }
    }

    async onModuleInit() {
        this.kafkaClient.subscribeToResponseOf('get-user-info');

        try {
            await this.kafkaClient.connect();
            this.logger.log('Kafka client connected successfully');
        } catch (error) {
            this.logger.error('Failed to connect Kafka client:', error);
        }
    }

    async onModuleDestroy() {
        await this.kafkaClient.close();
    }
}