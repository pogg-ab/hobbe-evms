import { Controller, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WiseService } from 'src/application/services/payment-methods/wise/wise.service';
import { WiseController } from 'src/presentation/controllers/payment-methods/wise/wise.controller';

@Module({
    imports: [ScheduleModule.forRoot(), WiseModule],
    controllers: [WiseController],
    providers: [WiseService],
  })
  
export class WiseModule {}
