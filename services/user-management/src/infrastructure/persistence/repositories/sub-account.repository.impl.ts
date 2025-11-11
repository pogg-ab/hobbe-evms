import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { SubAccount } from 'src/domain/entities/sub-account.entity';
import { ISubAccountRepository } from 'src/domain/repositories/sub-account.repository';
import { SubAccountID } from 'src/domain/value-objects/sub-account-id.value-object';
import { SubAccountStatus } from 'src/domain/value-objects/sub-account-status.value-object';
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
  async existsBetweenUsers(
    ownerUserId: string,
    subAccountUserId: string,
  ): Promise<boolean> {
    const result = await this.subAccountRepository.findOne({
      where: {
        owner_user: { user_id: ownerUserId },
        sub_account_user: { user_id: subAccountUserId },
      },
      select: ['sub_account_id'],
    });

    return !!result;
  }

  async findAll(): Promise<SubAccount[]> {
    try {
      const subAccounts = await this.subAccountRepository.find({
        relations: ['owner_user', 'sub_account_user'],
      });

      return subAccounts.map((sub) => instanceToPlain(sub) as SubAccount);
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
        relations: ['owner_user', 'sub_account_user'],
      });
      if (!account) {
        throw new HttpException(
          `Sub account with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return instanceToPlain(account) as SubAccount;
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

      if (subAccount.expire_date !== undefined) {
        existingAccount.expire_date = subAccount.expire_date;
      }

      if (subAccount.privileges !== undefined) {
        existingAccount.privileges = subAccount.privileges;
      }

      if (subAccount.status !== undefined && subAccount.status !== null) {
        if (typeof subAccount.status === 'string') {
          existingAccount.status = SubAccountStatus.create(
            subAccount.status as any,
          );
        } else if (subAccount.status instanceof SubAccountStatus) {
          existingAccount.status = subAccount.status;
        } else {
          throw new HttpException(
            `Invalid SubAccount Status`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const updatedAccount =
        await this.subAccountRepository.save(existingAccount);

      if (updatedAccount.owner_user) delete updatedAccount.owner_user.password;
      if (updatedAccount.sub_account_user)
        delete updatedAccount.sub_account_user.password;

      return updatedAccount;
    } catch (error) {
      throw new HttpException(
        `Error updating SubAccount: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const accountToDelete = await this.subAccountRepository.findOne({
        where: { sub_account_id: id },
      });
      if (!accountToDelete) {
        throw new HttpException(
          `Sub account with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.subAccountRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        `Error deleting SubAccount: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
