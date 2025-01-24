import { Chat } from "src/domain/entities/chat.entity"
import { CreateChatDto } from "src/presentation/dto/chat/create-chat.dto"


export interface IChatRepository {
    create(chat:Chat):Promise<Chat>
}