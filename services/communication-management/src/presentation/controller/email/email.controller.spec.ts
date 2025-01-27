import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateEmailDto } from 'src/presentation/dto/email/create-email.dto';
import { EmailController } from './email.controller';

describe('EmailController', () => {
  let controller: EmailController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EmailController>(EmailController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleKafkaPayload', () => {
    it('should successfully send email from Kafka payload', async () => {
      const payload: CreateEmailDto = {
        to: 'test@example.com',
        subject: 'Kafka Email Test',
        body: 'This is a test email sent from Kafka.',
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

      const result = await controller.handleKafkaPayload(payload);

      expect(result).toEqual({
        message: 'Email sent from Kafka payload successfully.',
      });
    });

    it('should fail to send email from Kafka payload if an error occurs', async () => {
      const payload: CreateEmailDto = {
        to: 'test@example.com',
        subject: 'Kafka Email Test',
        body: 'This is a test email sent from Kafka.',
      };

      jest
        .spyOn(commandBus, 'execute')
        .mockRejectedValue(new Error('Failed to send email'));

      const result = await controller.handleKafkaPayload(payload);

      expect(result).toEqual({
        message: 'Failed to send email from Kafka payload.',
      });
    });
  });
});
