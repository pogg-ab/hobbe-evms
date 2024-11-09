import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { IPersonalAccountRepository } from 'src/domain/repositories/personal-account.repository';
import { Repository } from 'typeorm';

@Injectable()
export class PersonalAccountRepositoryImpl
  implements IPersonalAccountRepository
{
  constructor(
    @InjectRepository(PersonalAccount)
    private readonly personalAccountRepository: Repository<PersonalAccount>,
  ) {}

  async create(personalAccount: PersonalAccount): Promise<PersonalAccount> {
    try {
      const newAccount = this.personalAccountRepository.create(personalAccount);
      return await this.personalAccountRepository.save(newAccount);
    } catch (error) {
      throw new HttpException(
        `Error creating PersonalAccount: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<PersonalAccount[]> {
    try {
      return await this.personalAccountRepository.find();
    } catch (error) {
      throw new HttpException(
        `Error fetching PersonalAccounts: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneById(id: string): Promise<PersonalAccount | null> {
    try {
      const account = await this.personalAccountRepository.findOne({
        where: { personal_account_id: id },
      });
      if (!account) {
        throw new HttpException(
          `Personal account with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return account;
    } catch (error) {
      throw new HttpException(
        `Error fetching PersonalAccount with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    personalAccount: PersonalAccount,
  ): Promise<PersonalAccount> {
    try {
      const existingAccount = await this.findOneById(id);
      if (!existingAccount) {
        throw new HttpException(
          `Personal account with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedAccount = Object.assign(existingAccount, personalAccount);

      return await this.personalAccountRepository.save(updatedAccount);
    } catch (error) {
      throw new HttpException(
        `Error updating PersonalAccount: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const accountToDelete = await this.findOneById(id);
      if (!accountToDelete) {
        throw new HttpException(
          `Personal account with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.personalAccountRepository.delete(accountToDelete);
    } catch (error) {
      throw new HttpException(
        `Error deleting PersonalAccount: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
