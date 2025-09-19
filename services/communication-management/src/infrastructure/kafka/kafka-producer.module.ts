import { Module } from '@nestjs/common';
import { KafkaProducerService } from './kafka.producer.servicce'; // Note the typo in the filename

@Module({
  providers: [KafkaProducerService],
  exports: [KafkaProducerService], // Export the service so other modules can use it
})
export class KafkaProducerModule {}