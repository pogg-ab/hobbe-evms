import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { FreshdeskConfigService } from 'src/infrastructure/support/freshdesk.config';
import { AutomapperModule } from '@automapper/nestjs';
import { CreateTicketCommandHandler } from 'src/application/handlers/support/create-ticket.command-handler';
import { UpdateTicketCommandHandler } from 'src/application/handlers/support/update-ticket.command-handler';
import { DeleteTicketCommandHandler } from 'src/application/handlers/support/delete-ticket.command-handler';
import { CreateAgentCommandHandler } from 'src/application/handlers/support/create-agent.command-handler';
import { UpdateAgentCommandHandler } from 'src/application/handlers/support/update-agent.command-handler';
import { DeleteAgentCommandHandler } from 'src/application/handlers/support/delete-agent.command-handler';
import { UpdateAgentAvailabilityCommandHandler } from 'src/application/handlers/support/update-agent-availability.command-handler';
import { CreateTimeEntryCommandHandler } from 'src/application/handlers/support/create-time-entry.command-handler';
import { DeleteTimeEntryCommandHandler } from 'src/application/handlers/support/delete-time-entry.command-handler';
import { CreateConversationCommandHandler } from 'src/application/handlers/support/create-conversation.command-handler';
import { UpdateConversationCommandHandler } from 'src/application/handlers/support/update-conversation.command-handler';
import { DeleteConversationCommandHandler } from 'src/application/handlers/support/delete-conversation.command-handler';
import { GetTicketQueryHandler } from 'src/application/handlers/support/get-ticket.query-handler';
import { ListTicketsQueryHandler } from 'src/application/handlers/support/list-tickets.query-handler';
import { SearchTicketsQueryHandler } from 'src/application/handlers/support/search-tickets.query-handler';
import { GetAgentQueryHandler } from 'src/application/handlers/support/get-agent.query-handler';
import { ListAgentsQueryHandler } from 'src/application/handlers/support/list-agents.query-handler';
import { GetAgentTimeReportQueryHandler } from 'src/application/handlers/support/get-agent-time-report.query-handler';
import { GetTimeEntryQueryHandler } from 'src/application/handlers/support/get-time-entry.query-handler';
import { GetTimeEntriesQueryHandler } from 'src/application/handlers/support/get-time-entries.query-handler';
import { GetAgentTimeEntriesQueryHandler } from 'src/application/handlers/support/get-agent-time-entries.query-handler';
import { GetConversationsQueryHandler } from 'src/application/handlers/support/get-conversations.query-handler';
import { TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/support/ticket.repository.token';
import { TicketRepositoryImpl } from 'src/infrastructure/support/ticket.repository.impl';
import { AGENT_REPOSITORY_TOKEN } from 'src/domain/repositories/support/agent.repository.token';
import { AgentRepositoryImpl } from 'src/infrastructure/support/agent.repository.impl';
import { TIME_ENTRY_REPOSITORY_TOKEN } from 'src/domain/repositories/support/time-entry.repository.token';
import { TimeEntryRepositoryImpl } from 'src/infrastructure/support/time-entry.repository.impl';
import { CONVERSATION_REPOSITORY_TOKEN } from 'src/domain/repositories/support/conversation.repository.token';
import { ConversationRepositoryImpl } from 'src/infrastructure/support/conversation.repository.impl';
import { TicketService } from 'src/application/services/support/ticket.service';
import { AgentService } from 'src/application/services/support/agent.service';
import { ConversationService } from 'src/application/services/support/conversation.service';
import { TimeEntryService } from 'src/application/services/support/time-entry.service';
import { SupportController } from 'src/presentation/controller/support/support.controller';
import { GetConversationQueryHandler } from 'src/application/handlers/support/get-conversation.query-handler';

const commandHandlers = [
  CreateTicketCommandHandler,
  UpdateTicketCommandHandler,
  DeleteTicketCommandHandler,
  CreateAgentCommandHandler,
  UpdateAgentCommandHandler,
  DeleteAgentCommandHandler,
  UpdateAgentAvailabilityCommandHandler,
  CreateTimeEntryCommandHandler,
  DeleteTimeEntryCommandHandler,
  CreateConversationCommandHandler,
  UpdateConversationCommandHandler,
  DeleteConversationCommandHandler,
];

const queryHandlers = [
  GetTicketQueryHandler,
  ListTicketsQueryHandler,
  SearchTicketsQueryHandler,
  GetAgentQueryHandler,
  ListAgentsQueryHandler,
  GetAgentTimeReportQueryHandler,
  GetTimeEntryQueryHandler,
  GetTimeEntriesQueryHandler,
  GetAgentTimeEntriesQueryHandler,
  GetConversationsQueryHandler,
  GetConversationQueryHandler,
];

@Module({
  imports: [CqrsModule, HttpModule, AutomapperModule],
  controllers: [SupportController],
  providers: [
    TicketService,
    AgentService,
    ConversationService,
    TimeEntryService,
    FreshdeskConfigService,
    ...commandHandlers,
    ...queryHandlers,
    {
      provide: TICKET_REPOSITORY_TOKEN,
      useClass: TicketRepositoryImpl,
    },
    {
      provide: AGENT_REPOSITORY_TOKEN,
      useClass: AgentRepositoryImpl,
    },
    {
      provide: TIME_ENTRY_REPOSITORY_TOKEN,
      useClass: TimeEntryRepositoryImpl,
    },
    {
      provide: CONVERSATION_REPOSITORY_TOKEN,
      useClass: ConversationRepositoryImpl,
    },
  ],
  exports: [FreshdeskConfigService, ...commandHandlers, ...queryHandlers],
})
export class SupportModule {}
