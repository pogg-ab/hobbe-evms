import { ICommand } from '@nestjs/cqrs';
import { CreateSmsDto } from 'src/presentation/dto/sms/create-sms.dto';
export class SendSmsCommand implements ICommand {
    constructor(public readonly createSmsDto: CreateSmsDto) { }
}
