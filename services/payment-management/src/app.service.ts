import { Inject, Injectable } from '@nestjs/common';
import { KafkaConsumerService } from './infrastructure/kafka/kafka.consumer.service';
import { BankAccounts } from './domain/entities/bank_accounts.entity';
import { CREATE_BANK_ACCOUNT_TOKEN } from './domain/repositories/bank-accouts/bank-accout.repository.token';
import { IBankAccountRepository } from './domain/repositories/bank-accouts/bank-account.repository';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { CreateBankAccountDto } from './presentation/dtos/bank-accounts/create-bank-acounts.dto';

@Injectable()
export class AppService {
  constructor(
    private readonly kafkaConsumerService: KafkaConsumerService,
    @Inject(CREATE_BANK_ACCOUNT_TOKEN)
    private readonly createBankAccountRepository: IBankAccountRepository,
    @InjectMapper() private readonly mapper: Mapper,
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
          bank_accounts.forEach(async(account: BankAccounts) => {
            const bankAccounts = this.mapper.map(
              {
                bank_name:account.bank_name,
                account_number: account.account_number, 
                account_owner:account.account_owner,
                country:account.country,
                currency:account.currency,
              },
              CreateBankAccountDto,
              BankAccounts,
            );
            return await this.createBankAccountRepository.create(
              null,
              (account.event_id).toString(),
              bankAccounts,
            );
          });
        },
      },
    );
  }
}
