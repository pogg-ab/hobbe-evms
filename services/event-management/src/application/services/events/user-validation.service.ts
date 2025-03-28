import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserValidationService {
  constructor(
    @Inject('KAFKA_VALIDATE_USER_SERVICE') private readonly eventClient: ClientKafka,
  ) { }

  async validateUser(payload: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.eventClient.send('validateEventUser', payload),
      );


      if (!response || !response.user) {
        throw new Error('Invalid JWT token or user not found');
      }

      // console.log(response.user);


      return response;
    } catch (error) {
      console.error('Error validating JWT via Kafka:', error);
      if (error instanceof Error) {
        throw new Error(`Error communicating with Kafka: ${error.message}`);
      }
      throw new Error(
        'Error occurred during Kafka communication, please check the logs for more details.',
      );
    }
  }
}
