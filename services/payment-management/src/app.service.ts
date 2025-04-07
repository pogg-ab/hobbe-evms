import { Inject, Injectable } from '@nestjs/common';
import { KafkaConsumerService } from './infrastructure/kafka/kafka.consumer.service';
import { BankAccounts } from './domain/entities/bank_accounts.entity';
import { CREATE_BANK_ACCOUNT_TOKEN } from './domain/repositories/bank-accouts/bank-accout.repository.token';
import { IBankAccountRepository } from './domain/repositories/bank-accouts/bank-account.repository';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { CreateBankAccountDto } from './presentation/dtos/bank-accounts/create-bank-acounts.dto';
import { ChapaSDKService } from 'src/application/services/payment-methods/chapa/chapa-sdk.service';
import { KafkaProducerService } from './infrastructure/kafka/kafka.producer.servicce';

@Injectable()
export class AppService {
  constructor(
    private readonly kafkaConsumerService: KafkaConsumerService,
    private readonly kafkaProducerService: KafkaProducerService,
    @Inject(CREATE_BANK_ACCOUNT_TOKEN)
    private readonly createBankAccountRepository: IBankAccountRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly chapaSdkService: ChapaSDKService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    await this.kafkaConsumerService.consume(
      { topics: ['bank-account-list-sent'] },
      {
        eachMessage: async ({ message }) => {
          const bank_accounts = JSON.parse(message.value.toString());
          bank_accounts.forEach(async (account: BankAccounts) => {
            const bankAccounts = this.mapper.map(
              {
                bank_name: account.bank_name,
                account_number: account.account_number,
                account_owner: account.account_owner,
                country: account.country,
                currency: account.currency,
                profit_share_amount: account.profit_share_amount,
              },
              CreateBankAccountDto,
              BankAccounts,
            );
            return await this.createBankAccountRepository.create(
              null,
              account.event_id.toString(),
              bankAccounts,
            );
          });
        },
      },
    );

    await this.kafkaConsumerService.paymentConsumer(
      { topics: ['payment_info_sent'] },
      {
        eachMessage: async ({ message }) => {
          const value = message.value?.toString();
          if (!value) return;
    
          const { event_id, booking_id, amount } = JSON.parse(value);
    
          const paymentLink = await this.chapaSdkService.paymentInit({
            event_id,
            booking_id,
            amount,
            currency: 'ETB',
            phone_number: '0900123456',
          });
    
          await this.kafkaProducerService.produce({
            topic: 'payment_link',
            messages: [{ value: JSON.stringify(paymentLink) }],
          });    
        },
      }
    );
    
  }
}
