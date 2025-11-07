import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatePromocodeCommandHandler } from 'src/application/handlers/promocodes/create-promocode.handler';
import { FindOnePoromocodeQueryHandler } from 'src/application/handlers/promocodes/find-one-promocode.handler';
import { FindPromocodeByEventIdHandler } from 'src/application/handlers/promocodes/find-promocode-by-eventid.handler';
import { UpdatePromocodeCommandHandler } from 'src/application/handlers/promocodes/update.promocode.handler';
import { PromocodeProfile } from 'src/application/mappers/promocode.profile';
import { PromocodeServices } from 'src/application/services/tickets/promocode/promocode.service';
import { Promocodes } from 'src/domain/entities/promocodes.entity';
import { CREATE_PROMOCODE_TOKEN } from 'src/domain/repositories/tickets/promocode.repository.token';
import { PromocodeRepositoryImpl } from 'src/infrastructure/persistence/repositories/promocode.repository.impl';
import { PromocodeController } from 'src/presentation/controllers/promocode/promocode.controller';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([Promocodes]),
    CqrsModule,
  ],
  controllers: [PromocodeController],
  providers: [
    PromocodeServices,
    PromocodeProfile,
    CreatePromocodeCommandHandler,
    FindOnePoromocodeQueryHandler,
    UpdatePromocodeCommandHandler,
    FindPromocodeByEventIdHandler,
    {
      provide: CREATE_PROMOCODE_TOKEN,
      useClass: PromocodeRepositoryImpl,
    },
  ],
  exports: [CREATE_PROMOCODE_TOKEN],
})
export class PromocodeModule { }
