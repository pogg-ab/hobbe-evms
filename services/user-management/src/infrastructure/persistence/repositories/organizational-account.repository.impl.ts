import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { IOrganizationalAccountRepository } from 'src/domain/repositories/organizational-account.repository';
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

  async findOneById(
    organizationalAccountId: string,
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
    organizationalAccountId: string,
    organizationalAccount: OrganizationalAccount,
  ): Promise<OrganizationalAccount> {
    try {
      await this.organizationalAccountRepository.update(
        organizationalAccountId,
        organizationalAccount,
      );
      return await this.organizationalAccountRepository.findOne({
        where: { organizational_account_id: organizationalAccountId },
      });
    } catch (error) {
      throw new HttpException(
        `Error updating Organizational Account with ID ${organizationalAccountId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(organizationalAccountId: string): Promise<void> {
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
}
