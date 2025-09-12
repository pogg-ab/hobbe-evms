import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { AgentService } from 'src/application/services/freshdesk/agent.service';
import { UpdateAgentAvailabilityCommand } from 'src/application/commands/freshdesk/update-agent-availability.command';
import { AgentResponseDto } from 'src/presentation/dto/freshdesk/agent/agent.dto';
import { UpdateAgentAvailabilityDto } from 'src/presentation/dto/freshdesk/agent/agent.dto';

@CommandHandler(UpdateAgentAvailabilityCommand)
export class UpdateAgentAvailabilityCommandHandler implements ICommandHandler<UpdateAgentAvailabilityCommand> {
    constructor(private readonly agentService: AgentService) { }

    async execute(command: UpdateAgentAvailabilityCommand): Promise<AgentResponseDto> {
        const { id, available } = command;
        const updateAgentAvailabilityDto: UpdateAgentAvailabilityDto = { available };
        return this.agentService.updateAgentAvailability(id, updateAgentAvailabilityDto);
    }
}