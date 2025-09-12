import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IConversationRepository } from 'src/domain/repositories/freshdesk/conversation.repository';
import { ConversationResponseDto, CreateConversationDto, UpdateConversationDto } from 'src/presentation/dto/freshdesk/conversation/conversation.dto';
import { Conversation } from 'src/domain/entities/freshdesk/conversation.entity';
import { CONVERSATION_REPOSITORY_TOKEN } from 'src/domain/repositories/freshdesk/conversation.repository.token';

@Injectable()
export class ConversationService {
    constructor(
        @Inject(CONVERSATION_REPOSITORY_TOKEN)
        private readonly conversationRepository: IConversationRepository) { }

    async createConversation(ticketId: number, createConversationDto: CreateConversationDto): Promise<ConversationResponseDto> {
        const conversation: Conversation = {
            id: 0,
            ticketId: ticketId,
            body: createConversationDto.body,
            fromEmail: createConversationDto.fromEmail,
            userId: createConversationDto.userId,
            isPrivate: createConversationDto.isPrivate,
            userName: '',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const createdConversation = await this.conversationRepository.create(conversation);
        return this.mapToConversationResponseDto(createdConversation);
    }

    async findAllConversations(): Promise<ConversationResponseDto[]> {
        const conversations = await this.conversationRepository.findAll();
        return conversations.map(this.mapToConversationResponseDto);
    }

    async findConversationById(id: number): Promise<ConversationResponseDto> {
        const conversation = await this.conversationRepository.findOneById(id);
        if (!conversation) {
            throw new NotFoundException(`Conversation with ID ${id} not found`);
        }
        return this.mapToConversationResponseDto(conversation);
    }

    async findConversationsByTicketId(ticketId: number): Promise<ConversationResponseDto[]> {
        const conversations = await this.conversationRepository.findByTicketId(ticketId);
        return conversations.map(this.mapToConversationResponseDto);
    }

    async findConversationsByUserId(userId: number): Promise<ConversationResponseDto[]> {
        const conversations = await this.conversationRepository.findByUserId(userId);
        return conversations.map(this.mapToConversationResponseDto);
    }

    async updateConversation(id: number, updateConversationDto: UpdateConversationDto): Promise<ConversationResponseDto> {
        const conversation = await this.conversationRepository.update(id, {
            body: updateConversationDto.body,
            isPrivate: updateConversationDto.isPrivate,
        });
        return this.mapToConversationResponseDto(conversation);
    }

    async deleteConversation(id: number): Promise<void> {
        await this.conversationRepository.delete(id);
    }

    private mapToConversationResponseDto(conversation: Conversation): ConversationResponseDto {
        return {
            id: conversation.id,
            ticketId: conversation.ticketId,
            body: conversation.body,
            fromEmail: conversation.fromEmail,
            userId: conversation.userId,
            isPrivate: conversation.isPrivate,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt
        };
    }
}