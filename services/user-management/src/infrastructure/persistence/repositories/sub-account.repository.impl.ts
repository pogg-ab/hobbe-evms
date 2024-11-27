import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubAccount } from 'src/domain/entities/sub-account.entity';
import { ISubAccountRepository } from 'src/domain/repositories/sub-account.repository';
import { SubAccountID } from 'src/domain/value-objects/sub-account-id.value-object';
import { Repository } from 'typeorm';

@Injectable()
export class SubAccountRepositoryImpl implements ISubAccountRepository {
  constructor(
    @InjectRepository(SubAccount)
    private readonly subAccountRepository: Repository<SubAccount>,
  ) {}

  async create(subAccount: SubAccount): Promise<SubAccount> {
    try {
      const newAccount = this.subAccountRepository.create(subAccount);
      return await this.subAccountRepository.save(newAccount);
    } catch (error) {
      throw new HttpException(
        `Error creating SubAccount: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<SubAccount[]> {
    try {
      return await this.subAccountRepository.find();
    } catch (error) {
      throw new HttpException(
        `Error fetching SubAccounts: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: SubAccountID): Promise<SubAccount | null> {
    try {
      const account = await this.subAccountRepository.findOne({
        where: { sub_account_id: id },
      });
      if (!account) {
        throw new HttpException(
          `Sub account with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return account;
    } catch (error) {
      throw new HttpException(
        `Error fetching SubAccount with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: SubAccountID, subAccount: SubAccount): Promise<SubAccount> {
    try {
      const existingAccount = await this.findOne(id);
      if (!existingAccount) {
        throw new HttpException(
          `Sub account with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedAccount = Object.assign(existingAccount, subAccount);
      return await this.subAccountRepository.save(updatedAccount);
    } catch (error) {
      throw new HttpException(
        `Error updating SubAccount: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: SubAccountID): Promise<void> {
    try {
      const accountToDelete = await this.findOne(id);
      if (!accountToDelete) {
        throw new HttpException(
          `Sub account with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.subAccountRepository.delete(accountToDelete);
    } catch (error) {
      throw new HttpException(
        `Error deleting SubAccount: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
