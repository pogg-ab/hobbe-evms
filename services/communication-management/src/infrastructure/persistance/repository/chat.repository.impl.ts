import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Chat } from "src/domain/entities/chat.entity";
import { IChatRepository } from "src/domain/repositories/chat/chat.repository";
import { CreateChatDto } from "src/presentation/dto/chat/create-chat.dto";
import { Repository } from "typeorm";


@Injectable()

export class ChatRepositoryImpl implements IChatRepository{

    constructor(
        @InjectRepository(Chat)
        private readonly chatRepository : Repository<Chat>
    ){}
    

    async create(chat: Chat):Promise<Chat>{
        return this.chatRepository.save(chat);
    }

    // async findAll() :Promise<Categories[]>{
    //     return await this.categoriesRepository.find();
    // }


    
}