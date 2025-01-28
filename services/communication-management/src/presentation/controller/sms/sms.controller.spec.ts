import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateSmsDto } from 'src/presentation/dto/sms/create-sms.dto';
import { SmsController } from './sms.controller';

describe('SmsController', () => {
    let controller: SmsController;
    let commandBus: CommandBus;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SmsController],
            providers: [
                {
                    provide: CommandBus,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<SmsController>(SmsController);
        commandBus = module.get<CommandBus>(CommandBus);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('handleKafkaPayload', () => {
        it('should successfully send SMS from Kafka payload', async () => {
            const payload: CreateSmsDto = {
                to: '1234567890',
                message: 'This is a test SMS sent from Kafka.',
            };

            jest.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

            const result = await controller.handleKafkaPayload(payload);

            expect(result).toEqual({
                message: 'SMS sent from Kafka payload successfully.',
            });
        });

        it('should fail to send SMS from Kafka payload if an error occurs', async () => {
            const payload: CreateSmsDto = {
                to: '1234567890',
                message: 'This is a test SMS sent from Kafka.',
            };

            jest
                .spyOn(commandBus, 'execute')
                .mockRejectedValue(new Error('Failed to send SMS'));

            const result = await controller.handleKafkaPayload(payload);

            expect(result).toEqual({
                message: 'Failed to send SMS from Kafka payload.',
            });
        });
    });
});
