import { InjectMapper } from "@automapper/nestjs";
import { Inject } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { BankAccounts } from "src/domain/entities/bank_accounts.entity";
import { IBankAccountRepository } from "src/domain/repositories/bank-accouts/bank-account.repository";
import { CREATE_BANK_ACCOUNT_TOKEN } from "src/domain/repositories/bank-accouts/bank-accout.repository.token";
import { CreateBankAccountDto } from "src/presentation/dtos/bank-accounts/create-bank-acounts.dto";
import { Mapper } from '@automapper/core';

export class BankAccountsServices{
    // constructor(
    //     @Inject(CREATE_BANK_ACCOUNT_TOKEN)
    //     private readonly createBankAccountRepository: IBankAccountRepository,
    //     @InjectMapper() private readonly mapper: Mapper,
    //     public readonly createBankAccountDto:CreateBankAccountDto,
    //     private readonly commandBus:CommandBus,
    //     // private readonly kafkaProducerService:KafkaProducerService
    //   ) {}
    // Implement bank account related services here
    // async createBankAccountFromEventMaicroService(accounts:BankAccounts[]): Promise<BankAccounts[]>{
    //     const accounts_list = this.createBankAccountRepository.createFromEventMS(accounts);
    //    return  accounts_list;
    // }
}