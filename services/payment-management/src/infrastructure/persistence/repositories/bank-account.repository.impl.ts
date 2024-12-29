

import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BankAccounts } from "src/domain/entities/bank_accounts.entity";
import { Promocodes } from "src/domain/entities/promocodes.entity";
import { IBankAccountRepository } from "src/domain/repositories/bank-accouts/bank-account.repository";
import { CreateBankAccountDto } from "src/presentation/dtos/bank-accounts/create-bank-acounts.dto";
import { Repository } from "typeorm";


@Injectable()
export class BankAccountRepositoryImpl implements IBankAccountRepository{
    constructor(
        @InjectRepository(BankAccounts)
        private bankAccountRepository: Repository<BankAccounts>,
    ){}
    async create(user:any, event:any,createBankAccountDto: CreateBankAccountDto): Promise<BankAccounts> {
        try {
            const newBankAccout = this.bankAccountRepository.create(createBankAccountDto);
            newBankAccout.user_id = user;
            newBankAccout.event_id = event;
            const account = await this.bankAccountRepository.save(newBankAccout);
            return account;
          } catch (error) {
            throw new HttpException(
              `Error creating bank account: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
    }

     async findByEvent(eventId: any): Promise<BankAccounts[]> {
        try {
            const bank_accounts = await this.bankAccountRepository
            .createQueryBuilder('bank_account')
            .where('bank_account.event_id = :eventId', { eventId }) // Directly query event_id
            .getMany();
    
          // Check if no events were found
          if (bank_accounts.length === 0) {
            throw new HttpException(
              `Bank Accounts with event id ${event} not found`,
              HttpStatus.NOT_FOUND,
            );
          }
    
          return bank_accounts;
        } catch (error) {
          throw new HttpException(
            `Error fetching bank accounts with event_id ${event}: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }



  

    // async findAll(): Promise<Promocodes[]> {
    //   try{
    //     return await this.promocodeRepository.find();

    //   }catch(error){
    //     throw new HttpException(
    //       `Error fetching Promocode ${error.message}`,
    //       HttpStatus.INTERNAL_SERVER_ERROR,
    //     );
    //   }
    // }

    async findOne(id:string):Promise<BankAccounts | null>{
      try {
        const bank_account = await this.bankAccountRepository.findOne({
          where: { id: id },
        });
  
        if (!bank_account) {
          throw new HttpException(
            `Bank Account with id ${id} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
        return bank_account;
      } catch (error) {
        throw new HttpException(
          `Error fetching bank account with ID ${id}: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

     async update(id: string, bank_account: BankAccounts): Promise<BankAccounts> {
        try {
          const bankAccountToBeUpdate = await this.findOne(id);
    
          const updatedAccount = Object.assign(bankAccountToBeUpdate, bank_account);
    
          return await this.bankAccountRepository.save(updatedAccount);
        } catch (error) {
          throw new HttpException(
            `Error updating bank account: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      async delete(id: string): Promise<void> {
        try {
          const bankAccontToDelete = await this.findOne(id);      
         
          await this.bankAccountRepository.delete(id);
        } catch (error) {
          throw new HttpException(
            `Error deleting bank accourt: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    
}
