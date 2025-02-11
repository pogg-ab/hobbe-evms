import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ChapaService } from 'src/application/services/payment-methods/chapa/chapa.service';
import { ChapaController } from 'src/presentation/controllers/payment-methods/chapa/chapa.controller';

@Module({
        imports: [ScheduleModule.forRoot(), ChapaModule],
        controllers: [ChapaController],
        providers: [ChapaService],
})
export class ChapaModule {}
