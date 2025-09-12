import { Injectable, NotFoundException } from '@nestjs/common';
import { Conversation } from 'src/domain/entities/freshdesk/conversation.entity';
import { IConversationRepository } from 'src/domain/repositories/freshdesk/conversation.repository';
import { FreshdeskConfigService } from 'src/infrastructure/freshdesk/freshdesk.config';
import axios from 'axios';

@Injectable()
export class ConversationRepositoryImpl implements IConversationRepository {
    constructor(private readonly configService: FreshdeskConfigService) { }

    async create(conversation: Conversation): Promise<Conversation> {
        const response = await axios.post(
            `${this.configService.baseUrl}/tickets/${conversation.id}/notes`,
            conversation,
            { headers: this.configService.authHeader }
        );
        return response.data as Conversation;
    }

    async findAll(): Promise<Conversation[]> {
        const response = await axios.get(
            `${this.configService.baseUrl}/conversations`,
            { headers: this.configService.authHeader }
        );
        return response.data as Conversation[];
    }

    async findOneById(id: number): Promise<Conversation | null> {
        try {
            const response = await axios.get(
                `${this.configService.baseUrl}/conversations/${id}`,
                { headers: this.configService.authHeader }
            );
            return response.data as Conversation;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async findByTicketId(ticketId: number): Promise<Conversation[]> {
        const response = await axios.get(
            `${this.configService.baseUrl}/tickets/${ticketId}/conversations`,
            { headers: this.configService.authHeader }
        );
        return response.data as Conversation[];
    }

    async update(id: number, conversation: Partial<Conversation>): Promise<Conversation> {
        try {
            const response = await axios.put(
                `${this.configService.baseUrl}/conversations/${id}`,
                conversation,
                { headers: this.configService.authHeader }
            );
            return response.data as Conversation;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException(`Conversation with ID ${id} not found`);
            }
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await axios.delete(
                `${this.configService.baseUrl}/conversations/${id}`,
                { headers: this.configService.authHeader }
            );
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException(`Conversation with ID ${id} not found`);
            }
            throw error;
        }
    }

    async findByUserId(userId: number): Promise<Conversation[]> {
        const response = await axios.get(
            `${this.configService.baseUrl}/conversations?user_id=${userId}`,
            { headers: this.configService.authHeader }
        );
        return response.data as Conversation[];
    }
}