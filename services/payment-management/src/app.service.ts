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
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    private readonly kafkaConsumerService: KafkaConsumerService,
    // private readonly kafkaProducerService: KafkaProducerService,
    @Inject(CREATE_BANK_ACCOUNT_TOKEN)
    private readonly createBankAccountRepository: IBankAccountRepository,
    @InjectMapper() private readonly mapper: Mapper,
    // private readonly chapaSdkService: ChapaSDKService,
    @InjectConnection() private readonly connection: Connection,
  ) { }
  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    await this.kafkaConsumerService.consume(
      { topics: ['bank-account-list-sent'] },
      {
        eachMessage: async ({ message }) => {
          try {
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
                account.user_id.toString(),
                account.event_id.toString(),
                bankAccounts,
              );
            });

            for (const account of bank_accounts) {
              try {
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

                const createdBankAccount = await this.createBankAccountRepository.create(
                  account.user_id.toString(),
                  account.event_id.toString(),
                  bankAccounts,
                );

                const bankAccountId = createdBankAccount.id;

                await this.insertFinancialAccountFunction(
                  bankAccountId.toString(),
                  account.currency,
                  account.user_id,
                  account.event_id
                );

                console.log(`Successfully processed bank account for event: ${account.event_id}`);

              } catch (accountError) {
                console.error(`Error processing individual bank account:`, accountError);
              }
            }
          } catch (error) {
            console.error('Error processing Kafka message:', error);
          }
        },
      },
    );



    // await this.kafkaConsumerService.paymentConsumer(
    //   { topics: ['payment_info_sent'] },
    //   {
    //     eachMessage: async ({ message }) => {
    //       const value = message.value?.toString();
    //       if (!value) return;
    //       const { event_id, booking_id, amount,user_id } = JSON.parse(value);
    //       const paymentLink = await this.chapaSdkService.paymentInit({
    //         event_id,
    //         booking_id,
    //         user_id,
    //         amount,
    //         currency: 'ETB',
    //         phone_number: '0900123456',
    //       });

    //       await this.kafkaProducerService.produce({
    //         topic: 'payment_link',
    //         messages: [{ value: JSON.stringify(paymentLink) }],
    //       });    
    //     },
    //   }
    // );

  }
  private async insertFinancialAccountFunction(
    bankAccountId: string,
    currencyId: string,
    userId: string,
    eventId: string
  ): Promise<void> {
    try {
      await this.connection.query(
        `SELECT fn_insert_financial_account($1, $2, $3, $4)`,
        [bankAccountId, currencyId, userId, eventId]
      );
      console.log(`✅ Financial account created successfully for bank account: ${bankAccountId}`);
    } catch (error) {
      console.error('Error calling PostgreSQL function:', error);
      throw new Error(`Failed to insert financial account: ${error.message}`);
    }
  }
}
