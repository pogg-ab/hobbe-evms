// src/application/commands/handlers/create-faq.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateFaqCommand } from '../../commands/faq/create-faq.command';
import { FaqService } from '../../services/faq/faq.service';

@CommandHandler(CreateFaqCommand)
export class CreateFaqHandler implements ICommandHandler<CreateFaqCommand> {
  constructor(private readonly service: FaqService) {}

  async execute(command: CreateFaqCommand) {
    const { creatorId, dto } = command;
    const faq = await this.service.createFaq(creatorId, dto as any);
    return {
      message: 'FAQ created successfully',
      data: faq,
    };
  }
}
