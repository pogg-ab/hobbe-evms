import { ICommand } from "@nestjs/cqrs";
import { CreateChatDto } from "src/presentation/dto/chat/create-chat.dto";
import { UpdateChatDto } from "src/presentation/dto/chat/update-chat.dto";


export class UpdateChatCommand implements ICommand{
    constructor(
        public readonly user:any,
        public readonly chat: UpdateChatDto,
    ){}
}