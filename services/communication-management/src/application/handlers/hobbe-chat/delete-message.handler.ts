import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteMessageCommand } from 'src/application/commands/hobbe-chat/delete-message.command';
import { MessageRepository } from 'src/domain/repositories/hobbe-chat/message.repository';
import { MESSAGE_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/message.repository.token copy';


@CommandHandler(DeleteMessageCommand)
export class DeleteMessageHandler implements ICommandHandler<DeleteMessageCommand> {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepo: MessageRepository
  ) {}

  async execute(command: DeleteMessageCommand): Promise<void> {
    await this.messageRepo.softDeleteMessage(command.messageId);
  }
}
