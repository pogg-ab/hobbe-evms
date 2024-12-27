import { InjectMapper } from "@automapper/nestjs";
import { Inject } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { BankAccounts } from "src/domain/entities/bank_accounts.entity";
import { IBankAccountRepository } from "src/domain/repositories/bank-accouts/bank-account.repository";
import { CREATE_BANK_ACCOUNT_TOKEN } from "src/domain/repositories/bank-accouts/bank-accout.repository.token";
import { CreateBankAccountDto } from "src/presentation/dtos/bank-accounts/create-bank-acounts.dto";
import { Mapper } from '@automapper/core';

export class BankAccountsServices{
    constructor(
        @Inject(CREATE_BANK_ACCOUNT_TOKEN)
        private readonly createBankAccountRepository: IBankAccountRepository,
        @InjectMapper() private readonly mapper: Mapper,
      ) {}
    
    async create(user:any,event:string, createBankAccountDto:CreateBankAccountDto): Promise<BankAccounts>{
        const bankAccounts  = this.mapper.map(createBankAccountDto,CreateBankAccountDto,BankAccounts);
        return await this.createBankAccountRepository.create(user,event,bankAccounts);
    }

    async findOne(id:string): Promise<BankAccounts>{
        return await this.createBankAccountRepository.findOne(id);
    }

    async findByEvent(event:string): Promise<BankAccounts[] | null>{
        return await this.createBankAccountRepository.findByEvent(event);
    }
}