import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { AgentService } from 'src/application/services/freshdesk/agent.service';
import { UpdateAgentCommand } from 'src/application/commands/freshdesk/update-agent.command';
import { AgentResponseDto } from 'src/presentation/dto/freshdesk/agent/agent.dto';
import { UpdateAgentDto } from 'src/presentation/dto/freshdesk/agent/agent.dto';

@CommandHandler(UpdateAgentCommand)
export class UpdateAgentCommandHandler implements ICommandHandler<UpdateAgentCommand> {
    constructor(private readonly agentService: AgentService) { }

    async execute(command: UpdateAgentCommand): Promise<AgentResponseDto> {
        const { id, name, email, role, available } = command;
        const updateAgentDto: UpdateAgentDto = { name, email, role, available };
        return this.agentService.updateAgent(id, updateAgentDto);
    }
}