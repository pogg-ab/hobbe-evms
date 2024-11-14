import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Email } from 'src/domain/entities/email.entity';
import { CreateEmailDto } from 'src/presentation/dtos/create-email.dto';

@Injectable()
export class EmailProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateEmailDto,
        Email,
        forMember(
          (destination) => destination.recipient,
          mapFrom((src) => src.recipient),
        ),
        forMember(
          (destination) => destination.subject,
          mapFrom((src) => src.subject),
        ),
        forMember(
          (destination) => destination.body,
          mapFrom((src) => src.body),
        ),
        forMember(
          (destination) => destination.sent_at,
          mapFrom(() => null),
        ),
        forMember(
          (destination) => destination.created_at,
          mapFrom(() => new Date()),
        ),
        forMember(
          (destination) => destination.updated_at,
          mapFrom(() => new Date()),
        ),
        forMember(
          (destination) => destination.updated_by,
          mapFrom(() => null),
        ),
      );
    };
  }
}
