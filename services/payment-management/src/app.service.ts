import { Injectable } from '@nestjs/common';
import { KafkaConsumerService } from './infrastructure/kafka/kafka.consumer.service';

@Injectable()
export class AppService {
  constructor(
    private readonly kafkaConsumerService:KafkaConsumerService,
  ){}
  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    await this.kafkaConsumerService.consume(
        {topics: ['bank-account-list-sent']},
        {eachMessage:async({message})=>{
            // console.log({
            //     value:message.value.toString(),
            // });
            
        } }
    );
  }
}
