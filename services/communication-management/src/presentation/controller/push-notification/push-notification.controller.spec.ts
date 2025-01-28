import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePushNotificationDto } from 'src/presentation/dto/push-notification/create-push-notification.dto';
import { PushNotificationController } from './push-notification.controller';

describe('PushNotificationController', () => {
  let controller: PushNotificationController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushNotificationController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PushNotificationController>(
      PushNotificationController,
    );
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleKafkaPayload', () => {
    it('should successfully send push notification from Kafka payload', async () => {
      const payload: CreatePushNotificationDto = {
        recipient: 'test@example.com',
        title: 'Kafka Push Notification Test',
        message: 'This is a test push notification sent from Kafka.',
        message_type: 'ALERT',
        platform: 'IOS',
        status: 'PENDING',
        priority: 1,
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

      const result = await controller.handleKafkaPayload(payload);

      expect(result).toEqual({
        message: 'Push notification sent from Kafka payload successfully.',
      });
    });

    it('should fail to send push notification from Kafka payload if an error occurs', async () => {
      const payload: CreatePushNotificationDto = {
        recipient: 'test@example.com',
        title: 'Kafka Push Notification Test',
        message: 'This is a test push notification sent from Kafka.',
        message_type: 'ALERT',
        platform: 'IOS',
        status: 'PENDING',
        priority: 1,
      };

      jest
        .spyOn(commandBus, 'execute')
        .mockRejectedValue(new Error('Failed to send push notification'));

      const result = await controller.handleKafkaPayload(payload);

      expect(result).toEqual({
        message: 'Failed to send push notification from Kafka payload.',
      });
    });
  });
});
