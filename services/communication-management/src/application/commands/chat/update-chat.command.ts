import { ICommand } from "@nestjs/cqrs";
import { CreateChatDto } from "src/presentation/dto/chat/create-chat.dto";


export class UpdateChatCommand implements ICommand{
    constructor(
        public readonly user:string,
        public readonly chat_id:string,
        public readonly text: string,
    ){}
}