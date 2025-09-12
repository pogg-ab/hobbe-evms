import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ConversationService } from 'src/application/services/freshdesk/conversation.service';
import { DeleteConversationCommand } from 'src/application/commands/freshdesk/delete-conversation.command';

@CommandHandler(DeleteConversationCommand)
export class DeleteConversationCommandHandler implements ICommandHandler<DeleteConversationCommand> {
    constructor(private readonly conversationService: ConversationService) { }

    async execute(command: DeleteConversationCommand): Promise<void> {
        const { id } = command;
        await this.conversationService.deleteConversation(id);
    }
}