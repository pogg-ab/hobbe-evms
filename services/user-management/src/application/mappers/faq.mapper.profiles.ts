
// src/application/mappers/faq.mapper.profile.ts
// src/application/mappers/faq.mapper.profile.ts
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Mapper, createMap, forMember, mapFrom } from '@automapper/core';
import { SupportFaq } from '../../domain/entities/support-faq.entity';
import { FaqResponseDto } from '../../presentation/dtos/faq-response.dto';

@Injectable()
export class FaqProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper): void => {
      /**
       * Basic map between entity and DTO.
       * The helper createMap(mapper, Source, Destination) registers the mapping.
       * Use forMember/mapFrom if you want to transform or rename fields.
       */
      createMap(mapper, SupportFaq, FaqResponseDto,
        // example explicit mappings (optional) — useful if you want to transform or be explicit
        forMember(
          (dest) => dest.id,
          mapFrom((src) => src.id),
        ),
        forMember(
          (dest) => dest.title,
          mapFrom((src) => src.title),
        ),
        forMember(
          (dest) => dest.content,
          mapFrom((src) => src.content),
        ),
        forMember(
          (dest) => dest.tags,
          mapFrom((src) => src.tags),
        ),
        forMember(
          (dest) => dest.created_by,
          mapFrom((src) => src.created_by),
        ),
        forMember(
          (dest) => dest.created_at,
          mapFrom((src) => src.created_at),
        ),
        forMember(
          (dest) => dest.updated_at,
          mapFrom((src) => src.updated_at),
        ),
      );
    };
  }
}

