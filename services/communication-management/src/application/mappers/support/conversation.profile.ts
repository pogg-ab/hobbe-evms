import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Conversation } from 'src/domain/entities/support/conversation.entity';
import { CreateConversationDto } from 'src/presentation/dto/support/conversation/conversation.dto';
import { UpdateConversationDto } from 'src/presentation/dto/support/conversation/conversation.dto';

@Injectable()
export class ConversationProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            // CreateConversationDto -> Conversation
            createMap(
                mapper,
                CreateConversationDto,
                Conversation,
                forMember(
                    (destination) => destination.body,
                    mapFrom((src) => src.body),
                ),
                forMember(
                    (destination) => destination.fromEmail,
                    mapFrom((src) => src.fromEmail),
                ),
                forMember(
                    (destination) => destination.userId,
                    mapFrom((src) => src.userId),
                ),
                forMember(
                    (destination) => destination.isPrivate,
                    mapFrom((src) => src.isPrivate || false),
                ),
                forMember(
                    (destination) => destination.createdAt,
                    mapFrom(() => new Date()),
                ),
                forMember(
                    (destination) => destination.updatedAt,
                    mapFrom(() => new Date()),
                ),
            );

            // UpdateConversationDto -> Conversation (partial mapping)
            createMap(
                mapper,
                UpdateConversationDto,
                Conversation,
                forMember(
                    (destination) => destination.body,
                    mapFrom((src) => src.body),
                ),
                forMember(
                    (destination) => destination.isPrivate,
                    mapFrom((src) => src.isPrivate),
                ),
                forMember(
                    (destination) => destination.updatedAt,
                    mapFrom(() => new Date()),
                ),
            );
        };
    }
}