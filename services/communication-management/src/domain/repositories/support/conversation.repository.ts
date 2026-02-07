import { Conversation } from 'src/domain/entities/support/conversation.entity';

export interface IConversationRepository {
  create(conversation: Conversation): Promise<Conversation>;
  findAll(): Promise<Conversation[]>;
  findOneById(id: number): Promise<any>;
  findByTicketId(ticketId: number): Promise<any[]>;
  update(
    id: number,
    conversation: Partial<Conversation>,
  ): Promise<Conversation>;
  delete(id: number): Promise<void>;
  findByUserId(userId: number): Promise<Conversation[]>;
}
