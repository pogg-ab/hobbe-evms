import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tax } from 'src/domain/entities/tax.entity';
import { TaxController } from 'src/presentation/controllers/tax/tax.controller';
import { TaxService } from 'src/application/services/tax/tax.service';
import { TaxRepositoryImpl } from 'src/infrastructure/persistence/repositories/tax.repository.impl';
import { CreateTaxCommandHandler } from 'src/application/handlers/tax/create-tax.command.handler';
import { UpdateTaxCommandHandler } from 'src/application/handlers/tax/update-tax.command.handler';
import { DeleteTaxCommandHandler } from 'src/application/handlers/tax/delete-tax.command.handler';
import { GetTaxByIdQueryHandler } from 'src/application/handlers/tax/get-tax-by-id.query.handler';
import { GetAllTaxesQueryHandler } from 'src/application/handlers/tax/get-all-taxes.query.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { TAX_REPOSITORY_TOKEN } from 'src/domain/repositories/tax/tax.repository.token';
import { AutomapperModule } from '@automapper/nestjs';
import { TaxProfile } from 'src/application/mappers/tax.profile';

@Module({
    imports: [
        AutomapperModule,
        TypeOrmModule.forFeature([Tax]),
        CqrsModule,
    ],
    controllers: [TaxController],
    providers: [
        TaxService,
        CreateTaxCommandHandler,
        UpdateTaxCommandHandler,
        DeleteTaxCommandHandler,
        GetTaxByIdQueryHandler,
        GetAllTaxesQueryHandler,
        TaxProfile,
        {
            provide: TAX_REPOSITORY_TOKEN,
            useClass: TaxRepositoryImpl,
        },
    ],
})
export class TaxModule { }