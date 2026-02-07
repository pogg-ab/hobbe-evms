import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Privileges, SubAccount } from 'src/domain/entities/sub-account.entity';
import { User } from 'src/domain/entities/user.entity';
import { ISubAccountRepository } from 'src/domain/repositories/sub-account.repository';
import { SUB_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/sub-account.repository.token';
import { SubAccountID } from 'src/domain/value-objects/sub-account-id.value-object';
import { SubAccountStatus } from 'src/domain/value-objects/sub-account-status.value-object';
import { CreateSubAccountDto } from 'src/presentation/dtos/create-sub-account.dto';
import { UpdateSubAccountDto } from 'src/presentation/dtos/update-sub-account.dto';
import { MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class SubAccountService {
  constructor(
    @Inject(SUB_ACCOUNT_REPOSITORY_TOKEN)
    private readonly subAccountRepository: ISubAccountRepository,
    @InjectRepository(SubAccount)
    private readonly subAccountRepositoryMain: Repository<SubAccount>,
    @InjectMapper() private readonly mapper: Mapper,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(
    createSubAccountDto: CreateSubAccountDto,
    userId: any,
  ): Promise<SubAccount> {
    if (userId === createSubAccountDto.sub_account_user_id) {
      throw new BadRequestException(
        'A user cannot create a sub-account for themselves',
      );
    }
    const exists = await this.subAccountRepository.existsBetweenUsers(
      userId,
      createSubAccountDto.sub_account_user_id,
    );

    if (exists) {
      throw new ConflictException(
        `Sub-account already exists between owner ${userId} and user ${createSubAccountDto.sub_account_user_id}`,
      );
    }

    const newSubAccount = await this.mapper.map(
      createSubAccountDto,
      CreateSubAccountDto,
      SubAccount,
    );
    newSubAccount.created_by = userId;
    const sub_account_user = await this.getUser(
      createSubAccountDto.sub_account_user_id,
    );
    const owner_user = await this.getUser(userId);
    newSubAccount.owner_user = owner_user;
    newSubAccount.sub_account_user = sub_account_user;
    const savedSubAccount =
      await this.subAccountRepository.create(newSubAccount);
    return savedSubAccount;
  }
  private async getUser(userId: string) {
    if (userId) {
      const user = await this.userRepo.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.is_active !== true) {
        throw new ForbiddenException('User is inactive');
      }

      return user;
    }

    throw new BadRequestException('User ID must be provided');
  }

  async findAll(): Promise<SubAccount[]> {
    return this.subAccountRepository.findAll();
  }

  async findOne(id: SubAccountID): Promise<SubAccount> {
    const subAccount = await this.subAccountRepository.findOne(id);
    if (!subAccount) {
      throw new NotFoundException(`SubAccount with ID ${id} not found`);
    }
    return subAccount;
  }

  async update(
    id: SubAccountID,
    updateSubAccountDto: UpdateSubAccountDto,
  ): Promise<SubAccount> {
    const updatedSubAccount = this.mapper.map(
      updateSubAccountDto,
      UpdateSubAccountDto,
      SubAccount,
    );

    await this.subAccountRepository.update(id, updatedSubAccount);
    return updatedSubAccount;
  }

  async deleteSubAccount(id: string): Promise<void> {
    await this.subAccountRepository.delete(id);
  }

  async checkCheckinPrivilege(
    staffUserId: string,
    eventOrganizerId: string,
  ): Promise<{
    hasPrivilege: boolean;
    canManageGuests: boolean;
    isExpired: boolean;
    message?: string;
    subAccount?: SubAccount;
  }> {
    try {
      if (!staffUserId || !eventOrganizerId) {
        throw new BadRequestException(
          'Staff User ID and Organizer User ID are required',
        );
      }

      if (staffUserId === eventOrganizerId) {
        return {
          hasPrivilege: true,
          canManageGuests: true,
          isExpired: false,
          message: 'Organizer has inherent check-in privileges',
          subAccount: null,
        };
      }

      const subAccount = await this.subAccountRepositoryMain.findOne({
        where: {
          owner_user: { user_id: eventOrganizerId },
          sub_account_user: { user_id: staffUserId },
        },
        relations: ['owner_user', 'sub_account_user'],
      });

      if (!subAccount) {
        return {
          hasPrivilege: false,
          canManageGuests: false,
          isExpired: false,
          message: 'No valid sub-account relationship found',
          subAccount: null,
        };
      }

      const today = new Date();
      const expire_date = new Date(subAccount.expire_date);

      if (expire_date < today) {
        const formattedDate = `${expire_date.getFullYear()}-${(expire_date.getMonth() + 1).toString().padStart(2, '0')}-${expire_date.getDate().toString().padStart(2, '0')}`;
        return {
          hasPrivilege: false,
          canManageGuests: false,
          isExpired: true,
          message: `Sub-account expired on ${formattedDate}`,
          subAccount: null,
        };
      }

      const canManageGuests =
        subAccount.privileges?.includes(Privileges.MANAGE_GUESTS) ?? false;
      const hasPrivilege = canManageGuests;

      if (!hasPrivilege) {
        return {
          hasPrivilege: false,
          canManageGuests: false,
          isExpired: false,
          message: 'Sub-account lacks required privileges',
          subAccount: subAccount,
        };
      }

      if (!subAccount.status || subAccount.status.toString() !== 'active') {
        return {
          hasPrivilege: false,
          canManageGuests: false,
          isExpired: false,
          message: `Sub-account status is ${subAccount.status?.toString() || 'undefined'} - must be active`,
          subAccount,
        };
      }

      return {
        hasPrivilege: true,
        canManageGuests: true,
        isExpired: false,
        subAccount,
      };
    } catch (error) {
      console.error('Error checking check-in privilege:', error);
      throw error;
    }
  }
}
