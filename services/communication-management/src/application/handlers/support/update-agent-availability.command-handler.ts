import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { AgentService } from 'src/application/services/support/agent.service';
import { UpdateAgentAvailabilityCommand } from 'src/application/commands/support/update-agent-availability.command';
import { AgentResponseDto } from 'src/presentation/dto/support/agent/agent.dto';
import { UpdateAgentAvailabilityDto } from 'src/presentation/dto/support/agent/agent.dto';

@CommandHandler(UpdateAgentAvailabilityCommand)
export class UpdateAgentAvailabilityCommandHandler implements ICommandHandler<UpdateAgentAvailabilityCommand> {
    constructor(private readonly agentService: AgentService) { }

    async execute(command: UpdateAgentAvailabilityCommand): Promise<AgentResponseDto> {
        const { id, available } = command;
        const updateAgentAvailabilityDto: UpdateAgentAvailabilityDto = { available };
        return this.agentService.updateAgentAvailability(id, updateAgentAvailabilityDto);
    }
}