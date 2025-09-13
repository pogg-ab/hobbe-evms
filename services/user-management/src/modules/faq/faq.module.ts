// src/modules/faq/faq.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { FaqService } from '../../application/services/faq.service';
import { FaqController } from '../../presentation/controllers/faq.controller';
import { FaqProfile } from '../../application/mappers/faq.mapper.profiles';
import { SupportFaq } from '../../domain/entities/support-faq.entity';
import { SupportFaqRepositoryImpl } from '../../infrastructure/persistence/repositories/support-faq.repository';
import { ISupportFaqRepository } from '../../domain/repositories/i-support-faq.repository.token';
import { CqrsModule } from '@nestjs/cqrs';

// command & query handlers
import { CreateFaqHandler } from '../../application/handlers/faq/create-faq.handler';
import { UpdateFaqHandler } from '../../application/handlers/faq/update-faq.handler';
import { DeleteFaqHandler } from '../../application/handlers/faq/delete-faq.handler';
import { GetFaqHandler } from '../../application/handlers/faq/get-faq.handler';
import { ListFaqsHandler } from '../../application/handlers/faq/list-faqs.handler';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([SupportFaq]),
    AutomapperModule.forRoot({ strategyInitializer: classes() }),
  ],
  controllers: [FaqController],
  providers: [
    FaqService,
    FaqProfile,

    // handlers
    CreateFaqHandler,
    UpdateFaqHandler,
    DeleteFaqHandler,
    GetFaqHandler,
    ListFaqsHandler,

    // repository provider (token -> impl)
    { provide: ISupportFaqRepository, useClass: SupportFaqRepositoryImpl },
  ],
  exports: [FaqService],
})
export class FaqModule {}

