import { Module } from '@nestjs/common';
import { EventsService } from 'src/application/services/events.service';
import { EventsController } from 'src/presentation/controllers/events.controller';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
