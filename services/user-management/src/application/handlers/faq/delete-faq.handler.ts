// src/application/commands/handlers/delete-faq.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteFaqCommand } from '../../commands/faq/delete-faq.command';
import { FaqService } from '../../services/faq.service';

@CommandHandler(DeleteFaqCommand)
export class DeleteFaqHandler implements ICommandHandler<DeleteFaqCommand> {
  constructor(private readonly service: FaqService) {}

  async execute(command: DeleteFaqCommand) {
    await this.service.deleteFaq(command.faqId);
    return {
      message: 'FAQ deleted successfully',
    };
  }
}
