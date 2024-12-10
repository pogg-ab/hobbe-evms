import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categories } from 'src/domain/entities/categories.entity';
import { CategoriesController } from 'src/presentation/controllers/categories/categories.controller';
import { CategoriesService } from 'src/application/services/categoriers/categories.service';
import { CategoriesProfile } from 'src/application/mappers/categories.profile';
import { CATEGORIES_REPOSITORY_TOKEN } from 'src/domain/repositories/categories/categories.repository.token';
import { CategoriesRepositoryImpl } from 'src/infrastructure/persistence/repositories/categories.repository.impl';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { CategoriesCommandHandler } from 'src/application/handlers/categories/categories.handler';
import { CategoriesFindByIdHandler } from 'src/application/handlers/categories/find-categories-by-id.handler';

@Module({
  
    imports: [
      AutomapperModule,
      TypeOrmModule.forFeature([Categories]),
      CqrsModule,
    ],
    controllers: [CategoriesController],
    providers: [
      CategoriesService,
      CategoriesProfile,
      CategoriesCommandHandler,
      CategoriesFindByIdHandler,
      {
        provide: CATEGORIES_REPOSITORY_TOKEN,
        useClass: CategoriesRepositoryImpl,
      },
    ],
    exports: [CATEGORIES_REPOSITORY_TOKEN], // Export for use in other modules
  })
  export class CategoriesModule {}
  
