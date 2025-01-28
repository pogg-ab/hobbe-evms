import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendSmsCommand } from 'src/application/commands/sms/send-sms.command';
import { SMSSenderService } from 'src/application/services/sms/sms-sender.service';
@Injectable()
@CommandHandler(SendSmsCommand)
export class SendSmsHandler implements ICommandHandler<SendSmsCommand> {
    constructor(private readonly smsService: SMSSenderService) { }

    async execute(command: SendSmsCommand): Promise<void> {
        const { createSmsDto } = command;

        try {
            await this.smsService.sendSMS(createSmsDto.recipient, createSmsDto.message, createSmsDto.messageType, createSmsDto.priority);
        } catch (error) {
            console.error('Error occurred while sending SMS:', error);
            throw error;
        }
    }
}
