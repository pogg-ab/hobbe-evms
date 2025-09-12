import { Conversation } from "src/domain/entities/freshdesk/conversation.entity";

export interface IConversationRepository {
    create(conversation: Conversation): Promise<Conversation>;
    findAll(): Promise<Conversation[]>;
    findOneById(id: number): Promise<Conversation | null>;
    findByTicketId(ticketId: number): Promise<Conversation[]>;
    update(id: number, conversation: Partial<Conversation>): Promise<Conversation>;
    delete(id: number): Promise<void>;
    findByUserId(userId: number): Promise<Conversation[]>;
}