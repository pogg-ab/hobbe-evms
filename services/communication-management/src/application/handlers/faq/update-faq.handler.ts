// src/application/commands/handlers/update-faq.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateFaqCommand } from '../../commands/faq/update-faq.command';
import { FaqService } from '../../services/faq/faq.service';

@CommandHandler(UpdateFaqCommand)
export class UpdateFaqHandler implements ICommandHandler<UpdateFaqCommand> {
  constructor(private readonly service: FaqService) {}

  async execute(command: UpdateFaqCommand) {
    const updated = await this.service.updateFaq(command.faqId, command.dto as any);
    return {
      message: 'FAQ updated successfully',
      data: updated,
    };
  }
}
