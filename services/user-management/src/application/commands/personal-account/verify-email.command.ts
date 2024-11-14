import { ICommand } from '@nestjs/cqrs';
import { VerifyEmailDto } from 'src/presentation/dtos/verify-email.dto';

export class VerifyEmailCommand implements ICommand {
  constructor(public readonly verifyEmailDto: VerifyEmailDto) {}
}
