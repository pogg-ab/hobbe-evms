import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { AgentService } from 'src/application/services/support/agent.service';
import { DeleteAgentCommand } from 'src/application/commands/support/delete-agent.command';

@CommandHandler(DeleteAgentCommand)
export class DeleteAgentCommandHandler implements ICommandHandler<DeleteAgentCommand> {
    constructor(private readonly agentService: AgentService) { }

    async execute(command: DeleteAgentCommand): Promise<void> {
        const { id } = command;
        await this.agentService.deleteAgent(id);
    }
}