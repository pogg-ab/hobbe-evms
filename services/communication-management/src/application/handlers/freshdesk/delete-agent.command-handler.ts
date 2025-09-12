import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { AgentService } from 'src/application/services/freshdesk/agent.service';
import { DeleteAgentCommand } from 'src/application/commands/freshdesk/delete-agent.command';

@CommandHandler(DeleteAgentCommand)
export class DeleteAgentCommandHandler implements ICommandHandler<DeleteAgentCommand> {
    constructor(private readonly agentService: AgentService) { }

    async execute(command: DeleteAgentCommand): Promise<void> {
        const { id } = command;
        await this.agentService.deleteAgent(id);
    }
}