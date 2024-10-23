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
}
