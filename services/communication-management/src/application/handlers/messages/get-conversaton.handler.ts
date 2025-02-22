import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
  import { InjectRepository } from '@nestjs/typeorm';
import { GetConversationQuery } from 'src/application/queries/messages/get-conversation.query';
import { Message } from 'src/domain/entities/message.entity';
  import { Repository } from 'typeorm';
  
  @QueryHandler(GetConversationQuery)
  export class GetConversationHandler implements IQueryHandler<GetConversationQuery> {
    constructor(
      @InjectRepository(Message)
      private readonly messageRepo: Repository<Message>,
    ) {}
  
    async execute(query: GetConversationQuery) {
      const { userId1, userId2 } = query;
      return await this.messageRepo.find({
        where: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
        order: { sentAt: 'DESC' },
        take: 50, // Limit for performance
      });
    }
  }