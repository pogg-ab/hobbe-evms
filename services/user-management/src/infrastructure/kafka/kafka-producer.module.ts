import { Module } from '@nestjs/common';
import { MessageProducerService } from './message.producer.service';

@Module({
  providers: [MessageProducerService],
  exports: [MessageProducerService],
})
export class KafkaProducerModule {}