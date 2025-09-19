// src/presentation/controllers/support.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiExtraModels,
  getSchemaPath,
  ApiConsumes,
} from '@nestjs/swagger';

import {
  AgentResponseDto,
  AgentTimeReportResponseDto,
  CreateAgentDto,
  UpdateAgentAvailabilityDto,
  UpdateAgentDto,
} from 'src/presentation/dto/support/agent/agent.dto';
import { UpdateAgentCommand } from 'src/application/commands/support/update-agent.command';
import { DeleteAgentCommand } from 'src/application/commands/support/delete-agent.command';
import { CreateAgentCommand } from 'src/application/commands/support/create-agent.command';
import {
  CreateTicketDto,
  TicketResponseDto,
  UpdateTicketDto,
} from 'src/presentation/dto/support/ticket/ticket.dto';
import {
  CreateTimeEntryDto,
  TimeEntryResponseDto,
} from 'src/presentation/dto/support/time-entry/time-entry.dto';
import {
  ConversationResponseDto,
  CreateConversationDto,
  UpdateConversationDto,
} from 'src/presentation/dto/support/conversation/conversation.dto';
import { ListTicketsQuery } from 'src/application/queries/support/list-tickets.query';
import { GetTicketQuery } from 'src/application/queries/support/get-ticket.query';
import { CreateTicketCommand } from 'src/application/commands/support/create-ticket.command';
import { UpdateTicketCommand } from 'src/application/commands/support/update-ticket.command';
import { DeleteTicketCommand } from 'src/application/commands/support/delete-ticket.command';
import { SearchTicketsQuery } from 'src/application/queries/support/search-tickets.query';
import { ListAgentsQuery } from 'src/application/queries/support/list-agents.query';
import { GetAgentQuery } from 'src/application/queries/support/get-agent.query';
import { UpdateAgentAvailabilityCommand } from 'src/application/commands/support/update-agent-availability.command';
import { GetAgentTimeReportQuery } from 'src/application/queries/support/get-agent-time-report.query';
import { GetTimeEntriesQuery } from 'src/application/queries/support/get-time-entries.query';
import { GetAgentTimeEntriesQuery } from 'src/application/queries/support/get-agent-time-entries.query';
import { GetTimeEntryQuery } from 'src/application/queries/support/get-time-entry.query';
import { CreateTimeEntryCommand } from 'src/application/commands/support/create-time-entry.command';
import { DeleteTimeEntryCommand } from 'src/application/commands/support/delete-time-entry.command';
import { GetConversationsQuery } from 'src/application/queries/support/get-conversations.query';
import { CreateConversationCommand } from 'src/application/commands/support/create-conversation.command';
import { UpdateConversationCommand } from 'src/application/commands/support/update-conversation.command';
import { DeleteConversationCommand } from 'src/application/commands/support/delete-conversation.command';
import { TicketProfile } from 'src/application/mappers/support/ticket.profile';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage, memoryStorage } from 'multer';
import { Readable } from 'stream';
import { AgentFilterDto } from 'src/presentation/dto/support/agent/agent-filter.dto';
import { SearchTicketsDto } from 'src/presentation/dto/support/ticket/search-tickets.dto';
import { GetConversationQuery } from 'src/application/queries/support/get-conversation.query';

@ApiTags('support')
@Controller('support')
@ApiExtraModels(
  TicketResponseDto,
  TimeEntryResponseDto,
  AgentResponseDto,
  AgentTimeReportResponseDto,
  ConversationResponseDto,
)
export class SupportController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('tickets')
  @ApiOperation({
    summary: 'Get all tickets with optional pagination and filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of tickets retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(TicketResponseDto) },
    },
  })
  async getTickets(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ): Promise<TicketResponseDto[]> {
    const tickets = await this.queryBus.execute(
      new ListTicketsQuery(page, perPage),
    );
    return tickets;
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get a specific ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 12345 })
  @ApiResponse({
    status: 200,
    description: 'Ticket details retrieved successfully',
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicket(@Param('id') id: number): Promise<TicketResponseDto> {
    const ticket = await this.queryBus.execute(new GetTicketQuery(id));
    return ticket;
  }

  @Post('tickets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 10 }], {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type'), false);
        }
      },
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
      },
    }),
  )
  @ApiBody({ type: CreateTicketDto })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createTicket(
    @Body() createTicketDto: CreateTicketDto,
    @UploadedFiles() files: { attachments?: Express.Multer.File[] },
  ): Promise<TicketResponseDto> {
    const attachmentBuffers =
      files.attachments?.map((file) => ({
        filename: file.originalname,
        buffer: new Uint8Array(file.buffer),
        contentType: file.mimetype,
        size: file.size,
      })) || [];
    const ticket = await this.commandBus.execute(
      new CreateTicketCommand(
        createTicketDto.subject,
        createTicketDto.description,
        createTicketDto.email,
        createTicketDto.priority,
        createTicketDto.status,
        attachmentBuffers,
      ),
    );
    return ticket;
  }

  @Put('tickets/:id')
  @ApiOperation({ summary: 'Update an existing ticket' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 10 }], {
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type'), false);
        }
      },
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
      },
    }),
  )
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 12345 })
  @ApiBody({ type: UpdateTicketDto })
  @ApiResponse({
    status: 200,
    description: 'Ticket updated successfully',
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateTicket(
    @Param('id') id: number,
    @Body() updateTicketDto: UpdateTicketDto,
    @UploadedFiles() files: { attachments?: Express.Multer.File[] },
  ): Promise<TicketResponseDto> {
    const attachmentBuffers =
      files.attachments?.map((file) => ({
        filename: file.originalname,
        buffer: new Uint8Array(file.buffer),
        contentType: file.mimetype,
        size: file.size,
      })) || [];
    const ticket = await this.commandBus.execute(
      new UpdateTicketCommand(
        id,
        updateTicketDto.subject,
        updateTicketDto.description,
        updateTicketDto.email,
        updateTicketDto.priority,
        updateTicketDto.status,
        attachmentBuffers,
      ),
    );
    return ticket;
  }

  @Delete('tickets/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 12345 })
  @ApiResponse({ status: 204, description: 'Ticket deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async deleteTicket(@Param('id') id: number): Promise<void> {
    await this.commandBus.execute(new DeleteTicketCommand(id));
  }

  @Get('search/tickets')
  @ApiOperation({
    summary: 'Search Freshdesk tickets using advanced query language',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tickets matching the query',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(TicketResponseDto) },
    },
  })
  async searchTickets(
    @Query() dto: SearchTicketsDto,
  ): Promise<TicketResponseDto[]> {
    const tickets = await this.queryBus.execute(new SearchTicketsQuery(dto));
    return tickets;
  }

  @Get('agents')
  @ApiOperation({ summary: 'Get all agents with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of agents retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(AgentResponseDto) },
    },
  })
  async getAgents(
    @Query() filters: AgentFilterDto,
  ): Promise<AgentResponseDto[]> {
    const agents = await this.queryBus.execute(new ListAgentsQuery(filters));
    return agents;
  }

  @Get('agents/:id')
  @ApiOperation({ summary: 'Get a specific agent by ID' })
  @ApiParam({ name: 'id', description: 'Agent ID', example: 5678 })
  @ApiResponse({
    status: 200,
    description: 'Agent details retrieved successfully',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgent(@Param('id') id: number): Promise<AgentResponseDto> {
    const agent = await this.queryBus.execute(new GetAgentQuery(id));
    return agent;
  }

  @Put('agents/:id/availability')
  @ApiOperation({ summary: 'Update agent availability status' })
  @ApiParam({ name: 'id', description: 'Agent ID', example: 5678 })
  @ApiBody({ type: UpdateAgentAvailabilityDto })
  @ApiResponse({
    status: 200,
    description: 'Agent availability updated successfully',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async updateAgentAvailability(
    @Param('id') id: number,
    @Body() updateAgentAvailabilityDto: UpdateAgentAvailabilityDto,
  ): Promise<AgentResponseDto> {
    const agent = await this.commandBus.execute(
      new UpdateAgentAvailabilityCommand(
        id,
        updateAgentAvailabilityDto.available,
      ),
    );
    return agent;
  }

  @Get('agents/:id/time-report')
  @ApiOperation({ summary: 'Get time report for a specific agent' })
  @ApiParam({ name: 'id', description: 'Agent ID', example: 5678 })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date of the report period (ISO string)',
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date of the report period (ISO string)',
    example: '2023-01-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Time report retrieved successfully',
    type: AgentTimeReportResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgentTimeReport(
    @Param('id') id: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<AgentTimeReportResponseDto> {
    const report = await this.queryBus.execute(
      new GetAgentTimeReportQuery(id, new Date(startDate), new Date(endDate)),
    );
    return report;
  }

  @Post('agents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new agent' })
  @ApiBody({ type: CreateAgentDto })
  @ApiResponse({
    status: 201,
    description: 'Agent created successfully',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Agent with email already exists' })
  async createAgent(
    @Body() createAgentDto: CreateAgentDto,
  ): Promise<AgentResponseDto> {
    const agent = await this.commandBus.execute(
      new CreateAgentCommand(
        createAgentDto.name,
        createAgentDto.email,
        createAgentDto.role,
        createAgentDto.available,
      ),
    );
    return agent;
  }

  @Put('agents/:id')
  @ApiOperation({ summary: 'Update an existing agent' })
  @ApiParam({ name: 'id', description: 'Agent ID', example: 5678 })
  @ApiBody({ type: UpdateAgentDto })
  @ApiResponse({
    status: 200,
    description: 'Agent updated successfully',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateAgent(
    @Param('id') id: number,
    @Body() updateAgentDto: UpdateAgentDto,
  ): Promise<AgentResponseDto> {
    const agent = await this.commandBus.execute(
      new UpdateAgentCommand(
        id,
        updateAgentDto.name,
        updateAgentDto.email,
        updateAgentDto.role,
        updateAgentDto.available,
      ),
    );
    return agent;
  }

  @Delete('agents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an agent' })
  @ApiParam({ name: 'id', description: 'Agent ID', example: 5678 })
  @ApiResponse({ status: 204, description: 'Agent deleted successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async deleteAgent(@Param('id') id: number): Promise<void> {
    await this.commandBus.execute(new DeleteAgentCommand(id));
  }

  @Get('tickets/:ticketId/time-entries')
  @ApiOperation({ summary: 'Get all time entries for a specific ticket' })
  @ApiParam({ name: 'ticketId', description: 'Ticket ID', example: 12345 })
  @ApiResponse({
    status: 200,
    description: 'List of time entries retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(TimeEntryResponseDto) },
    },
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTimeEntries(
    @Param('ticketId') ticketId: number,
  ): Promise<TimeEntryResponseDto[]> {
    const timeEntries = await this.queryBus.execute(
      new GetTimeEntriesQuery(ticketId),
    );
    return timeEntries;
  }

  @Get('agents/:agentId/time-entries')
  @ApiOperation({ summary: 'Get all time entries for a specific agent' })
  @ApiParam({ name: 'agentId', description: 'Agent ID', example: 5678 })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter (ISO string)',
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter (ISO string)',
    example: '2023-01-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: 'List of time entries retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(TimeEntryResponseDto) },
    },
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgentTimeEntries(
    @Param('agentId') agentId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TimeEntryResponseDto[]> {
    const timeEntries = await this.queryBus.execute(
      new GetAgentTimeEntriesQuery(
        agentId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      ),
    );
    return timeEntries;
  }

  @Get('time-entries/:id')
  @ApiOperation({ summary: 'Get a specific time entry by ID' })
  @ApiParam({ name: 'id', description: 'Time Entry ID', example: 445566 })
  @ApiResponse({
    status: 200,
    description: 'Time entry details retrieved successfully',
    type: TimeEntryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  async getTimeEntry(@Param('id') id: number): Promise<TimeEntryResponseDto> {
    const timeEntry = await this.queryBus.execute(new GetTimeEntryQuery(id));
    return timeEntry;
  }

  @Post('tickets/:ticketId/time-entries')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a time entry to a ticket' })
  @ApiParam({ name: 'ticketId', description: 'Ticket ID', example: 12345 })
  @ApiBody({ type: CreateTimeEntryDto })
  @ApiResponse({
    status: 201,
    description: 'Time entry added successfully',
    type: TimeEntryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ticket or agent not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createTimeEntry(
    @Param('ticketId') ticketId: number,
    @Body() createTimeEntryDto: CreateTimeEntryDto,
  ): Promise<TimeEntryResponseDto> {
    const timeEntry = await this.commandBus.execute(
      new CreateTimeEntryCommand(
        ticketId,
        createTimeEntryDto.agentId,
        createTimeEntryDto.note,
        createTimeEntryDto.timeSpent,
        createTimeEntryDto.executedAt
          ? new Date(createTimeEntryDto.executedAt)
          : new Date(),
      ),
    );
    return timeEntry;
  }

  @Delete('time-entries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a time entry' })
  @ApiParam({ name: 'id', description: 'Time Entry ID', example: 445566 })
  @ApiResponse({ status: 204, description: 'Time entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  async deleteTimeEntry(@Param('id') id: number): Promise<void> {
    await this.commandBus.execute(new DeleteTimeEntryCommand(id));
  }

  @Get('tickets/:ticketId/conversations')
  @ApiOperation({ summary: 'Get all conversations for a specific ticket' })
  @ApiParam({ name: 'ticketId', description: 'Ticket ID', example: 12345 })
  @ApiResponse({
    status: 200,
    description: 'List of conversations retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(ConversationResponseDto) },
    },
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getConversations(
    @Param('ticketId') ticketId: number,
  ): Promise<ConversationResponseDto[]> {
    const conversations = await this.queryBus.execute(
      new GetConversationsQuery(ticketId),
    );
    return conversations;
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a specific conversation by ID' })
  @ApiParam({ name: 'id', description: 'Conversation ID', example: 112233 })
  @ApiResponse({
    status: 200,
    description: 'Conversation details retrieved successfully',
    type: ConversationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(
    @Param('id') id: number,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.queryBus.execute(
      new GetConversationQuery(id),
    );
    return conversation;
  }

  @Post('tickets/:ticketId/conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a conversation to a ticket' })
  @ApiParam({ name: 'ticketId', description: 'Ticket ID', example: 12345 })
  @ApiBody({ type: CreateConversationDto })
  @ApiResponse({
    status: 201,
    description: 'Conversation added successfully',
    type: ConversationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createConversation(
    @Param('ticketId') ticketId: number,
    @Body() createConversationDto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.commandBus.execute(
      new CreateConversationCommand(
        ticketId,
        createConversationDto.body,
        createConversationDto.fromEmail,
        createConversationDto.userId,
        createConversationDto.isPrivate,
      ),
    );
    return conversation;
  }

  @Put('conversations/:id')
  @ApiOperation({ summary: 'Update a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID', example: 112233 })
  @ApiBody({ type: UpdateConversationDto })
  @ApiResponse({
    status: 200,
    description: 'Conversation updated successfully',
    type: ConversationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateConversation(
    @Param('id') id: number,
    @Body() updateConversationDto: UpdateConversationDto,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.commandBus.execute(
      new UpdateConversationCommand(
        id,
        updateConversationDto.body,
        updateConversationDto.isPrivate,
      ),
    );
    return conversation;
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID', example: 112233 })
  @ApiResponse({
    status: 204,
    description: 'Conversation deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async deleteConversation(@Param('id') id: number): Promise<void> {
    await this.commandBus.execute(new DeleteConversationCommand(id));
  }
}
