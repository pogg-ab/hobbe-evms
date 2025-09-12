import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { FreshdeskConfigService } from 'src/infrastructure/freshdesk/freshdesk.config';
import { AutomapperModule } from '@automapper/nestjs';
import { CreateTicketCommandHandler } from 'src/application/handlers/freshdesk/create-ticket.command-handler';
import { UpdateTicketCommandHandler } from 'src/application/handlers/freshdesk/update-ticket.command-handler';
import { DeleteTicketCommandHandler } from 'src/application/handlers/freshdesk/delete-ticket.command-handler';
import { CreateAgentCommandHandler } from 'src/application/handlers/freshdesk/create-agent.command-handler';
import { UpdateAgentCommandHandler } from 'src/application/handlers/freshdesk/update-agent.command-handler';
import { DeleteAgentCommandHandler } from 'src/application/handlers/freshdesk/delete-agent.command-handler';
import { UpdateAgentAvailabilityCommandHandler } from 'src/application/handlers/freshdesk/update-agent-availability.command-handler';
import { CreateTimeEntryCommandHandler } from 'src/application/handlers/freshdesk/create-time-entry.command-handler';
import { DeleteTimeEntryCommandHandler } from 'src/application/handlers/freshdesk/delete-time-entry.command-handler';
import { CreateConversationCommandHandler } from 'src/application/handlers/freshdesk/create-conversation.command-handler';
import { UpdateConversationCommandHandler } from 'src/application/handlers/freshdesk/update-conversation.command-handler';
import { DeleteConversationCommandHandler } from 'src/application/handlers/freshdesk/delete-conversation.command-handler';
import { GetTicketQueryHandler } from 'src/application/handlers/freshdesk/get-ticket.query-handler';
import { ListTicketsQueryHandler } from 'src/application/handlers/freshdesk/list-tickets.query-handler';
import { SearchTicketsQueryHandler } from 'src/application/handlers/freshdesk/search-tickets.query-handler';
import { GetAgentQueryHandler } from 'src/application/handlers/freshdesk/get-agent.query-handler';
import { ListAgentsQueryHandler } from 'src/application/handlers/freshdesk/list-agents.query-handler';
import { GetAgentByEmailQueryHandler } from 'src/application/handlers/freshdesk/get-agent-by-email.query-handler';
import { GetAgentTimeReportQueryHandler } from 'src/application/handlers/freshdesk/get-agent-time-report.query-handler';
import { GetTimeEntryQueryHandler } from 'src/application/handlers/freshdesk/get-time-entry.query-handler';
import { GetTimeEntriesQueryHandler } from 'src/application/handlers/freshdesk/get-time-entries.query-handler';
import { GetAgentTimeEntriesQueryHandler } from 'src/application/handlers/freshdesk/get-agent-time-entries.query-handler';
import { GetConversationsQueryHandler } from 'src/application/handlers/freshdesk/get-conversations.query-handler';
import { TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/freshdesk/ticket.repository.token';
import { TicketRepositoryImpl } from 'src/infrastructure/freshdesk/ticket.repository.impl';
import { AGENT_REPOSITORY_TOKEN } from 'src/domain/repositories/freshdesk/agent.repository.token';
import { AgentRepositoryImpl } from 'src/infrastructure/freshdesk/agent.repository.impl';
import { TIME_ENTRY_REPOSITORY_TOKEN } from 'src/domain/repositories/freshdesk/time-entry.repository.token';
import { TimeEntryRepositoryImpl } from 'src/infrastructure/freshdesk/time-entry.repository.impl';
import { CONVERSATION_REPOSITORY_TOKEN } from 'src/domain/repositories/freshdesk/conversation.repository.token';
import { ConversationRepositoryImpl } from 'src/infrastructure/freshdesk/conversation.repository.impl';
import { TicketService } from 'src/application/services/freshdesk/ticket.service';
import { AgentService } from 'src/application/services/freshdesk/agent.service';
import { ConversationService } from 'src/application/services/freshdesk/conversation.service';
import { TimeEntryService } from 'src/application/services/freshdesk/time-entry.service';
import { SupportController } from 'src/presentation/controller/freshdesk/support.controller';

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
    GetAgentByEmailQueryHandler,
    GetAgentTimeReportQueryHandler,
    GetTimeEntryQueryHandler,
    GetTimeEntriesQueryHandler,
    GetAgentTimeEntriesQueryHandler,
    GetConversationsQueryHandler,
    GetConversationsQueryHandler,
];

@Module({
    imports: [
        CqrsModule,
        HttpModule,
        AutomapperModule
    ],
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
    exports: [
        FreshdeskConfigService,
        ...commandHandlers,
        ...queryHandlers,
    ],
})
export class FreshdeskModule { }