import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ConversationService } from 'src/application/services/freshdesk/conversation.service';
import { UpdateConversationCommand } from 'src/application/commands/freshdesk/update-conversation.command';
import { ConversationResponseDto } from 'src/presentation/dto/freshdesk/conversation/conversation.dto';
import { UpdateConversationDto } from 'src/presentation/dto/freshdesk/conversation/conversation.dto';

@CommandHandler(UpdateConversationCommand)
export class UpdateConversationCommandHandler implements ICommandHandler<UpdateConversationCommand> {
    constructor(private readonly conversationService: ConversationService) { }

    async execute(command: UpdateConversationCommand): Promise<ConversationResponseDto> {
        const { id, body, isPrivate } = command;
        const updateConversationDto: UpdateConversationDto = { body, isPrivate };
        return this.conversationService.updateConversation(id, updateConversationDto);
    }
}