
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { BankAccounts } from 'src/domain/entities/bank_accounts.entity';
import { CreateBankAccountDto } from 'src/presentation/dtos/bank-accounts/create-bank-acounts.dto';



@Injectable()
export class BankAccountProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateBankAccountDto,
        BankAccounts,
        forMember(
          (destination) => destination.bank_name,
          mapFrom((src) => src.bank_name),
        ),

        forMember(
          (destination) => destination.account_owner,
          mapFrom((src) => src.account_owner),
        ),

        forMember(
            (destination) => destination.account_number,
            mapFrom((src) => src.account_number),
          ),
        forMember(
          (destination) => destination.country,
          mapFrom((src) => src.country),
        ),

        forMember(
          (destination) => destination.currency,
          mapFrom((src) => src.currency),
        ),

      );

    };
  }
}
