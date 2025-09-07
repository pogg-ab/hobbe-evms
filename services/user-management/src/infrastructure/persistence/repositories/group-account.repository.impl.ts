// src/infrastructure/repositories/group-account.repository.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupAccount } from 'src/domain/entities/group-account.entity';
import { IGroupAccountRepository } from 'src/domain/repositories/group-account.repository';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class GroupAccountRepositoryImpl implements IGroupAccountRepository {
  constructor(
    @InjectRepository(GroupAccount)
    private readonly groupAccountRepository: Repository<GroupAccount>,
  ) {}

  async create(
    manager: EntityManager,
    groupAccount: GroupAccount,
  ): Promise<GroupAccount> {
    try {
      const newGroupAccount = this.groupAccountRepository.create(groupAccount);
      return await manager.save(newGroupAccount);
    } catch (error) {
      throw new HttpException(
        `Error creating group account: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: string): Promise<GroupAccount | null> {
    try {
      return await this.groupAccountRepository.findOne({
        where: { group_account_id: id },
        relations: ['primary_organizer', 'linked_organizer'],
      });
    } catch (error) {
      throw new HttpException(
        `Error finding group account with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    groupAccounts: GroupAccount[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      const groupAccounts = await this.groupAccountRepository.find({
        where: [{ primary_user_id: userId }, { linked_user_id: userId }],
        relations: ['primary_organizer', 'linked_organizer'],
        take: limit,
        skip: offset,
      });

      const total = await this.groupAccountRepository.count({
        where: [{ primary_user_id: userId }, { linked_user_id: userId }],
      });

      // Remove sensitive fields from related users
      await Promise.all(
        groupAccounts.map(async (groupAccount) => {
          if (groupAccount.primary_organizer) {
            this.removeSensitiveFields(groupAccount.primary_organizer);
          }
          if (groupAccount.linked_organizer) {
            this.removeSensitiveFields(groupAccount.linked_organizer);
          }
        }),
      );

      return {
        groupAccounts: groupAccounts || null,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new HttpException(
        `Error fetching group accounts for user with ID ${userId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const groupAccount = await this.groupAccountRepository.findOne({
        where: { group_account_id: id },
      });
      if (!groupAccount) {
        throw new HttpException(
          `Group account with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.groupAccountRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        `Error deleting group account: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByPrimaryAndLinked(
    primaryUserId: string,
    linkedUserId: string,
  ): Promise<GroupAccount | null> {
    try {
      return await this.groupAccountRepository.findOne({
        where: [
          { primary_user_id: primaryUserId, linked_user_id: linkedUserId },
          { primary_user_id: linkedUserId, linked_user_id: primaryUserId },
        ],
        relations: ['primary_organizer', 'linked_organizer'],
      });
    } catch (error) {
      throw new HttpException(
        `Error finding group account for primaryUserId ${primaryUserId} and linkedUserId ${linkedUserId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private removeSensitiveFields(user: any): void {
    const fieldsToRemove = [
      'password',
      'password_reset_token',
      'password_reset_token_expiry',
      'password_reset_requested_at',
      'otp',
      'otp_expiry',
    ];

    fieldsToRemove.forEach((field) => {
      delete user[field];
    });
  }
}
