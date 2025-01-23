import { ICommand } from "@nestjs/cqrs";
import { CreateChatDto } from "src/presentation/dto/chat/create-chat.dto";


export class CreateChatCommand implements ICommand{
    constructor(
        public readonly sender_id:string,
        public readonly createChatDto: CreateChatDto,
    ){}
}