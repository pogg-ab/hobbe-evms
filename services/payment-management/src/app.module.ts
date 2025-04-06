import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaConsumerService } from './infrastructure/kafka/kafka.consumer.service';
import { ConfigModule } from '@nestjs/config';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { CqrsModule } from '@nestjs/cqrs';
import { BankAccountsModule } from './modules/bank-accounts/bank-account.module';
import { WiseModule } from './modules/payment-methods/wise/wise.module';
import { ChapaModule } from './modules/payment-methods/chapa/chapa.module';
import { ChapaSDKService } from './application/services/payment-methods/chapa/chapa-sdk.service';
import { KafkaProducerService } from './infrastructure/kafka/kafka.producer.servicce';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AutomapperModule.forRoot([
      {
        name: 'default',
        strategyInitializer: classes(),
      },
    ]),
    DatabaseModule,
    CqrsModule,
    BankAccountsModule,
    WiseModule,
    ChapaModule,
  ],
  providers: [
    AppService, 
    KafkaConsumerService,
    KafkaProducerService,
  ],
})
export class AppModule { }
