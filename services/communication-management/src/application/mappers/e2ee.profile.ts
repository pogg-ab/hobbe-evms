import { createMap, forMember, mapFrom, Mapper } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import { E2EE } from "src/domain/entities/e2ee.entity";
import { E2EEDto } from "src/presentation/dto/e2ee/create.e2ee.dto";

@Injectable()
export class E2EEProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        E2EEDto,
        E2EE,
        forMember(
          (destination) => destination.user_id,
          mapFrom((src) => src.user_id),
        ),

        forMember(
          (destination) => destination.private_key,
          mapFrom((src) => src.privateKey),
        ),

        forMember(
          (destination) => destination.public_key,
          mapFrom((src) => src.publicKey),
        ),
      );
    };
  }
}
