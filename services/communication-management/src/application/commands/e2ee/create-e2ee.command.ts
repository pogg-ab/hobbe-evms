import { ICommand } from "@nestjs/cqrs";
import { CreateChatDto } from "src/presentation/dto/chat/create-chat.dto";
import { E2EEDto } from "src/presentation/dto/e2ee/create.e2ee.dto";


export class CreateE2EECommand implements ICommand{
    constructor(
        public readonly e2eeDto: E2EEDto,
    ){}
}