import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices'; // <-- 1. IMPORT
import { BankAccounts } from 'src/domain/entities/bank_accounts.entity';
import { BankAccountsController } from 'src/presentation/controllers/banks/banks-accounts.controller';
import { BankAccountsServices } from 'src/application/services/bank-accounts/bank-accounts.service';
import { BankAccountProfile } from 'src/application/mappers/bank-account.profile';
import { CreateBankAccountHandler } from 'src/application/handlers/bank-account/create.bank-account.handler';
import { CREATE_BANK_ACCOUNT_TOKEN } from 'src/domain/repositories/bank-accouts/bank-accout.repository.token';
import { BankAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/bank-account.repository.impl';
import { FindOneBankAccountHandler } from 'src/application/handlers/bank-account/find-one.bank-account.handler';
import { FindBankAccountByEventQueryHandler } from 'src/application/handlers/bank-account/find-by-event.handler';
import { UpdateBankAccountHandler } from 'src/application/handlers/bank-account/update.bank-account.handler';
import { DeleteBankAccountHandler } from 'src/application/handlers/bank-account/delete.bank-accout.handler';


@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([BankAccounts]),
    CqrsModule,
    
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER', 
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment-management-producer',
            brokers: [process.env.KAFKA_BROKER],
          },
        },
      },
    ]),
  ],
  controllers: [BankAccountsController],
  providers: [
    BankAccountsServices,
    BankAccountProfile,
    CreateBankAccountHandler,
    FindOneBankAccountHandler,
    FindBankAccountByEventQueryHandler,
    UpdateBankAccountHandler,
    DeleteBankAccountHandler,
    
    {
      provide: CREATE_BANK_ACCOUNT_TOKEN,
      useClass: BankAccountRepositoryImpl,
    },
  ],
  exports: [CREATE_BANK_ACCOUNT_TOKEN],
})
export class BankAccountsModule {}