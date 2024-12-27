import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountsServices } from 'src/application/services/bank-accounts/bank-accounts.service';
import { BankAccounts } from 'src/domain/entities/bank_accounts.entity';
import { CREATE_BANK_ACCOUNT_TOKEN } from 'src/domain/repositories/bank-accouts/bank-accout.repository.token';
import { BankAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/bank-account.repository.impl';
import { BanksController } from 'src/presentation/controllers/banks/banks.controller';

@Module({
  
    imports: [
      AutomapperModule,
      TypeOrmModule.forFeature([BankAccounts]),
      CqrsModule,
    ],
    controllers: [BanksController],
    providers: [
      BankAccountsServices,
      // BankAccountRepositoryImpl,
      // {
      //   provide: CREATE_BANK_ACCOUNT_TOKEN,
      //   useClass: BankAccountRepositoryImpl,
      // },
    ],
    // exports: [CREATE_BANK_ACCOUNT_TOKEN],
    
  })
export class BankAccoutsModule {}
