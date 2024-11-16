import { ICommand } from '@nestjs/cqrs';
import { CreateEmailDto } from 'src/presentation/dtos/create-email.dto';

export class SendEmailCommand implements ICommand {
  constructor(public readonly createEmailDto: CreateEmailDto) {}
}
