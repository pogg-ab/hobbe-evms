import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { User } from 'src/domain/entities/user.entity';
import { IPersonalAccountRepository } from 'src/domain/repositories/personal-account.repository';
import { PERSONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/personal-account.repository.token';
// import { IUserRoleRepository } from 'src/domain/repositories/user-role.repository';
// import { USER_ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/user-role.repository.token';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { CreatePersonalAccountDto } from '../../presentation/dtos/create-personal-account.dto';
import { UpdatePersonalAccountDto } from '../../presentation/dtos/update-personal-account.dto';

@Injectable()
export class PersonalAccountService {
  constructor(
    @Inject(PERSONAL_ACCOUNT_REPOSITORY_TOKEN)
    private readonly personalAccountRepository: IPersonalAccountRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    // @Inject(USER_ROLE_REPOSITORY_TOKEN)
    // private readonly userRole: IUserRoleRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}
  async create(
    createPersonalAccountDto: CreatePersonalAccountDto,
  ): Promise<PersonalAccount> {
    const newAccount = this.mapper.map(
      createPersonalAccountDto,
      CreatePersonalAccountDto,
      PersonalAccount,
    );
    const savedAccount =
      await this.personalAccountRepository.create(newAccount);
    const user = this.mapper.map(
      createPersonalAccountDto,
      CreatePersonalAccountDto,
      User,
    );
    user.password = await this.hashPassword(createPersonalAccountDto.password);
    user.personal_account = savedAccount.personal_account_id;

    // const newUserRole = await this.userRole.create();

    await this.userRepository.create(user);
    return savedAccount;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  findAll() {
    return `This action returns all personalAccount`;
  }

  findOne(id: number) {
    return `This action returns a #${id} personalAccount`;
  }

  update(id: number, updatePersonalAccountDto: UpdatePersonalAccountDto) {
    return `This action updates a #${id} personalAccount`;
  }

  remove(id: number) {
    return `This action removes a #${id} personalAccount`;
  }
}
