import { createMap, forMember, mapFrom, Mapper } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import { EventShare } from "src/domain/entities/event-share.entity";
import { ShareEventDto } from "src/presentation/dtos/share-event/share-event.dto";

@Injectable()
export class EventShareProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ShareEventDto,
        EventShare,
        forMember(
          (destination) => destination.event_id,
          mapFrom((src) => src.event_id) 
        ),

        forMember(
          (destination) => destination.shared_with_users,
          mapFrom((src) => src.shared_with_users)
        ),

        forMember(
          (destination) => destination.shared_at,
          mapFrom(() => new Date()) 
        ),

        forMember(
          (destination) => destination.updated_at,
          mapFrom(() => null) 
        ),
      );
    };
  }
}
