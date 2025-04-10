import { createMap, forMember, mapFrom, Mapper } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import { Comments } from "src/domain/entities/comments.entity";
import { CommentsDto } from "src/presentation/dtos/comments/comments.dto";


@Injectable()
export class CommentsProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CommentsDto,
        Comments,

        forMember(
          (destination) => destination.event_id,
          mapFrom((src) => src.event_id),
        ),

        forMember(
          (destination) => destination.comment,
          mapFrom((src) => src.comment),
        ),
        forMember(
          (destination) => destination.created_at,
          mapFrom((src) => new Date()),
        ),

      );

    };
  }
}
