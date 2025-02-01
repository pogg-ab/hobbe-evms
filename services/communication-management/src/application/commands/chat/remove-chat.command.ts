import { ICommand } from "@nestjs/cqrs";
import { RemoveChatDto } from "src/presentation/dto/chat/remove-chat.dto";


export class RemoveChatCommand implements ICommand{
    constructor(
        public readonly user:any,
        public readonly chat: RemoveChatDto,
    ){}
}