import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Chat } from 'src/domain/entities/chat.entity';
import { CreateChatDto } from 'src/presentation/dto/chat/create-chat.dto';

@Injectable()
export class ChatProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateChatDto,
        Chat,
        forMember(
          (destination) => destination.text,
          mapFrom((src) => src.text),
        ),

        forMember(
          (destination) => destination.room,
          mapFrom((src) => src.to),
        ),

        forMember(
          (destination) => destination.file,
          mapFrom((src) => src.file),
        ),
        forMember(
          (destination) => destination.audio,
          mapFrom((src) => src.audio),
        ),
        // forMember(
        //     (destination) => destination.created_at,
        //     mapFrom(() => new Date()),
        //   ),
      );
    };
  }
}
