
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Categories } from 'src/domain/entities/categories.entity';
import { CreateCategoriesDto } from 'src/presentation/dtos/categories/categories.dto';



@Injectable()
export class CategoriesProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateCategoriesDto,
        Categories,
        forMember(
          (destination) => destination.name,
          mapFrom((src) => src.name),
        ),

        forMember(
          (destination) => destination.description,
          mapFrom((src) => src.description),
        ),

      );

    };
  }
}
