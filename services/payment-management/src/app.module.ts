import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaConsumerService } from './infrastructure/kafka/kafka.consumer.service';
import { BankAccoutsModule } from './modules/bank-accounts/bank-account.module';
import { ConfigModule } from '@nestjs/config';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { CqrsModule } from '@nestjs/cqrs';
import { BankAccountRepositoryImpl } from './infrastructure/persistence/repositories/bank-account.repository.impl';

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
    BankAccoutsModule
  ],
  controllers: [AppController],
  providers: [AppService,KafkaConsumerService],
})
export class AppModule {}
