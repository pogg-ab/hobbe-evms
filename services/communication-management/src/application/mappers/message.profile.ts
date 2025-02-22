import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, createMap } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Message } from 'src/domain/entities/message.entity';
import { MessageDto } from 'src/presentation/dto/messages/message.dto';


@Injectable()
export class MessageProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, Message, MessageDto);
    };
  }
}
