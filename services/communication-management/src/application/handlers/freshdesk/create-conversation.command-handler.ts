import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ConversationService } from 'src/application/services/freshdesk/conversation.service';
import { CreateConversationCommand } from 'src/application/commands/freshdesk/create-conversation.command';
import { ConversationResponseDto } from 'src/presentation/dto/freshdesk/conversation/conversation.dto';
import { CreateConversationDto } from 'src/presentation/dto/freshdesk/conversation/conversation.dto';

@CommandHandler(CreateConversationCommand)
export class CreateConversationCommandHandler implements ICommandHandler<CreateConversationCommand> {
    constructor(private readonly conversationService: ConversationService) { }

    async execute(command: CreateConversationCommand): Promise<ConversationResponseDto> {
        const { ticketId, body, fromEmail, userId, isPrivate } = command;
        const createConversationDto: CreateConversationDto = { body, fromEmail, userId, isPrivate };
        return this.conversationService.createConversation(ticketId, createConversationDto);
    }
}