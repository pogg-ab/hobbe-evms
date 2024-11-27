import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubAccount } from 'src/domain/entities/sub-account.entity';
import { ISubAccountRepository } from 'src/domain/repositories/sub-account.repository';
import { SUB_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/sub-account.repository.token';
import { SubAccountID } from 'src/domain/value-objects/sub-account-id.value-object';
import { CreateSubAccountDto } from 'src/presentation/dtos/create-sub-account.dto';
import { UpdateSubAccountDto } from 'src/presentation/dtos/update-sub-account.dto';

@Injectable()
export class SubAccountService {
  constructor(
    @Inject(SUB_ACCOUNT_REPOSITORY_TOKEN)
    private readonly subAccountRepository: ISubAccountRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async create(createSubAccountDto: CreateSubAccountDto): Promise<SubAccount> {
    const newSubAccount = this.mapper.map(
      createSubAccountDto,
      CreateSubAccountDto,
      SubAccount,
    );
    const savedSubAccount =
      await this.subAccountRepository.create(newSubAccount);
    return savedSubAccount;
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
    const subAccount = await this.findOne(id);
    const updatedSubAccount = this.mapper.map(
      updateSubAccountDto,
      UpdateSubAccountDto,
      SubAccount,
    );
    await this.subAccountRepository.update(id, updatedSubAccount);
    return updatedSubAccount;
  }

  async deleteSubAccount(id: SubAccountID): Promise<void> {
    const subAccount = await this.findOne(id);
    await this.subAccountRepository.delete(id);
  }
}
