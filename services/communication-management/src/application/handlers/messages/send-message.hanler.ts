import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { SendMessageCommand } from 'src/application/commands/messages/send-message.command';
import { Message } from 'src/domain/entities/message.entity';
import { Repository } from 'typeorm';

@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<SendMessageCommand> {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async execute(command: SendMessageCommand) {
    const { senderId, receiverId, content } = command;
    const message = this.messageRepo.create({ senderId, receiverId, content });
    return await this.messageRepo.save(message);
  }
}