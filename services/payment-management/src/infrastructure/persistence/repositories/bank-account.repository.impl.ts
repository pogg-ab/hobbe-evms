

import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BankAccounts } from "src/domain/entities/bank_accounts.entity";
import { Promocodes } from "src/domain/entities/promocodes.entity";
import { IBankAccountRepository } from "src/domain/repositories/bank-accouts/bank-account.repository";
import { CreateBankAccountDto } from "src/presentation/dtos/bank-accounts/create-bank-acounts.dto";
import { CreatePromocodeDto } from "src/presentation/dtos/tickets/create-promocode.dto";
import { Repository } from "typeorm";


@Injectable()
export class BankAccountRepositoryImpl implements IBankAccountRepository{
    constructor(
        @InjectRepository(Promocodes)
        private bankAccountRepository: Repository<BankAccounts>,
    ){}
    async create(createBankAccountDto: CreateBankAccountDto): Promise<BankAccounts> {
        try {
            const newBankAccout = this.bankAccountRepository.create(createBankAccountDto);
            return await this.bankAccountRepository.save(newBankAccout);
          } catch (error) {
            throw new HttpException(
              `Error creating Promocode: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
    }
    async createFromEventMS(accounts: BankAccounts[]): Promise<BankAccounts[]> {
        try {
            // accounts.
            // const newBankAccout = this.bankAccountRepository.create(createBankAccountDto);
            // return await this.bankAccountRepository.save(newBankAccout);
            return accounts;
          } catch (error) {
            throw new HttpException(
              `Error creating Promocode: ${error.message}`,
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

    // async findOne(id:number):Promise<Promocodes>{
    //   try {
    //     const promocode = await this.promocodeRepository.findOne({
    //       where: { id: id },
    //     });
  
    //     if (!promocode) {
    //       throw new HttpException(
    //         `Promocode with id ${id} not found`,
    //         HttpStatus.NOT_FOUND,
    //       );
    //     }
    //     return promocode;
    //   } catch (error) {
    //     throw new HttpException(
    //       `Error fetching promocode with ID ${id}: ${error.message}`,
    //       HttpStatus.INTERNAL_SERVER_ERROR,
    //     );
    //   }
    // }

    // async update(id:number,promocode:Promocodes):Promise<Promocodes>{
    //   try {
    //     const promocodeToBeUpdate = await this.findOne(id);
  
    //     const updatedPromocode = Object.assign(promocodeToBeUpdate, promocode);
       
  
    //     return await this.promocodeRepository.save(updatedPromocode);
    //   } catch (error) {
    //     throw new HttpException(
    //       `Error Updating Promocode: ${error.message}`,
    //       HttpStatus.INTERNAL_SERVER_ERROR,
    //     );
    //   }
    // }
    
}
