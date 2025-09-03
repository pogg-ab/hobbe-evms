import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { CommissionFee } from 'src/domain/entities/commission-fee.entity';
import { CommissionFeeController } from 'src/presentation/controllers/commission-fee/commission-fee.controller';
import { CommissionFeeService } from 'src/application/services/commission-fee/commission-fee.service';
import { CommissionFeeRepositoryImpl } from 'src/infrastructure/persistence/repositories/commission-fee.repository.impl';
import { CreateCommissionFeeCommandHandler } from 'src/application/handlers/commission-fee/create-commission-fee.command.handler';
import { UpdateCommissionFeeCommandHandler } from 'src/application/handlers/commission-fee/update-commission-fee.command.handler';
import { DeleteCommissionFeeCommandHandler } from 'src/application/handlers/commission-fee/delete-commission-fee.command.handler';
import { GetCommissionFeeByIdQueryHandler } from 'src/application/handlers/commission-fee/get-commission-fee-by-id.query.handler';
import { GetAllCommissionFeesQueryHandler } from 'src/application/handlers/commission-fee/get-all-commission-fees.query.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { COMMISSION_FEE_REPOSITORY_TOKEN } from 'src/domain/repositories/commission-fee/commission-fee.repository.token';
import { CommissionFeeProfile } from 'src/application/mappers/commission-fee.profile';

@Module({
    imports: [
        TypeOrmModule.forFeature([CommissionFee]),
        CqrsModule,
        AutomapperModule.forRoot({
            strategyInitializer: classes(),
        }),
    ],
    controllers: [CommissionFeeController],
    providers: [
        CommissionFeeService,
        {
            provide: COMMISSION_FEE_REPOSITORY_TOKEN,
            useClass: CommissionFeeRepositoryImpl,
        },
        CreateCommissionFeeCommandHandler,
        UpdateCommissionFeeCommandHandler,
        DeleteCommissionFeeCommandHandler,
        GetCommissionFeeByIdQueryHandler,
        GetAllCommissionFeesQueryHandler,
        CommissionFeeProfile,
    ],
})
export class CommissionFeeModule { }