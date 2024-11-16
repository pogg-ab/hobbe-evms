import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { IPersonalAccountRepository } from 'src/domain/repositories/personal-account.repository';
import { PersonalAccountID } from 'src/domain/value-objects/personal-account-id.value-object';
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

  async findOneById(id: PersonalAccountID): Promise<PersonalAccount | null> {
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
    id: PersonalAccountID,
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

  async delete(id: PersonalAccountID): Promise<void> {
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

  async sendEmailVerificationDb(email_address: string): Promise<any> {
    try {
      const personalAccount = await this.personalAccountRepository.findOne({
        where: { email_address: email_address },
      });

      if (!personalAccount) {
        throw new HttpException(
          `User with email ${email_address} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.personalAccountRepository.save(personalAccount);

      return { message: 'Email verification sent successfully.' };
    } catch (error) {
      throw new HttpException(
        `Error sending email verification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByEmail(email_address: string): Promise<PersonalAccount | null> {
    try {
      const account = await this.personalAccountRepository.findOne({
        where: { email_address },
      });
      return account || null;
    } catch (error) {
      throw new HttpException(
        `Error fetching PersonalAccount by email ${email_address}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
