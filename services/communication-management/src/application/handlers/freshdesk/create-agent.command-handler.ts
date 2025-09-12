import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { AgentService } from 'src/application/services/freshdesk/agent.service';
import { CreateAgentCommand } from 'src/application/commands/freshdesk/create-agent.command';
import { AgentResponseDto } from 'src/presentation/dto/freshdesk/agent/agent.dto';
import { CreateAgentDto } from 'src/presentation/dto/freshdesk/agent/agent.dto';

@CommandHandler(CreateAgentCommand)
export class CreateAgentCommandHandler implements ICommandHandler<CreateAgentCommand> {
    constructor(private readonly agentService: AgentService) { }

    async execute(command: CreateAgentCommand): Promise<AgentResponseDto> {
        const { name, email, role, available } = command;
        const createAgentDto: CreateAgentDto = { name, email, role, available };
        return this.agentService.createAgent(createAgentDto);
    }
}