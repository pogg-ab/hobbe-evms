import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { IOrganizationalAccountRepository } from 'src/domain/repositories/organizational-account.repository';
import { OrganizationalAccountID } from 'src/domain/value-objects/organizational-account-id.value-object';
import { Repository } from 'typeorm';

@Injectable()
export class OrganizationalAccountRepositoryImpl
  implements IOrganizationalAccountRepository
{
  constructor(
    @InjectRepository(OrganizationalAccount)
    private readonly organizationalAccountRepository: Repository<OrganizationalAccount>,
  ) {}

  async create(
    organizationalAccount: OrganizationalAccount,
  ): Promise<OrganizationalAccount> {
    try {
      const newOrganizationalAccount =
        this.organizationalAccountRepository.create(organizationalAccount);
      return await this.organizationalAccountRepository.save(
        newOrganizationalAccount,
      );
    } catch (error) {
      throw new HttpException(
        `Error creating Organizational Account: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async find(): Promise<OrganizationalAccount[]> {
    try {
      return await this.organizationalAccountRepository.find();
    } catch (error) {
      throw new HttpException(
        `Error fetching organizational account: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneById(
    organizationalAccountId: OrganizationalAccountID,
  ): Promise<OrganizationalAccount | null> {
    try {
      return await this.organizationalAccountRepository.findOne({
        where: { organizational_account_id: organizationalAccountId },
      });
    } catch (error) {
      throw new HttpException(
        `Error fetching Organizational Account with ID ${organizationalAccountId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: OrganizationalAccountID,
    organizationalAccount: OrganizationalAccount,
  ): Promise<OrganizationalAccount> {
    try {
      const existingAccount = await this.findOneById(id);
      if (!existingAccount) {
        throw new HttpException(
          `Personal account with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedAccount = Object.assign(
        existingAccount,
        organizationalAccount,
      );

      return await this.organizationalAccountRepository.save(updatedAccount);
    } catch (error) {
      throw new HttpException(
        `Error updating Organizational Account with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(organizationalAccountId: string): Promise<void> {
    try {
      await this.organizationalAccountRepository.delete(
        organizationalAccountId,
      );
    } catch (error) {
      throw new HttpException(
        `Error deleting Organizational Account with ID ${organizationalAccountId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendEmailVerificationDb(company_email: string): Promise<any> {
    try {
      const organizationalAccount =
        await this.organizationalAccountRepository.findOne({
          where: { company_email: company_email },
        });

      if (!organizationalAccount) {
        throw new HttpException(
          `User with email ${company_email} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.organizationalAccountRepository.save(organizationalAccount);

      return { message: 'Email verification sent successfully.' };
    } catch (error) {
      throw new HttpException(
        `Error sending email verification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByEmail(
    company_email: string,
  ): Promise<OrganizationalAccount | null> {
    try {
      const account = await this.organizationalAccountRepository.findOne({
        where: { company_email },
      });
      return account || null;
    } catch (error) {
      throw new HttpException(
        `Error fetching PersonalAccount by email ${company_email}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
