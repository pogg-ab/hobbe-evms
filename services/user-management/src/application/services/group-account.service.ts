import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupAccount } from 'src/domain/entities/group-account.entity';
import { User } from 'src/domain/entities/user.entity';
import { IGroupAccountRepository } from 'src/domain/repositories/group-account.repository';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { GROUP_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/group-account.repository.token';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { CreateGroupAccountDto } from 'src/presentation/dtos/group-account/create-group-account.dto';
import { Repository } from 'typeorm';

@Injectable()
export class GroupAccountService {
  constructor(
    @Inject(GROUP_ACCOUNT_REPOSITORY_TOKEN)
    private readonly groupAccountRepository: IGroupAccountRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async remove(groupAccountId: string, removedBy: string): Promise<void> {
    const groupAccount =
      await this.groupAccountRepository.findById(groupAccountId);
    if (!groupAccount) {
      throw new NotFoundException(
        `Group account with ID ${groupAccountId} not found`,
      );
    }

    if (groupAccount.created_by !== removedBy) {
      throw new BadRequestException(
        'Only the creator can remove this group account',
      );
    }

    await this.groupAccountRepository.delete(groupAccountId);
  }

  async findGroupAccountsByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    groupAccounts: GroupAccount[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    return this.groupAccountRepository.findAllByUserId(userId, page, limit);
  }
}
