import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity'; // Adjust the path
import { Role } from 'src/domain/entities/role.entity';
import { User } from 'src/domain/entities/user.entity';
import { AccountStatus } from 'src/domain/value-objects/account-status.value-object';
import { CreateRoleDto } from 'src/presentation/dtos/create-role.dto';
import { CreatePersonalAccountDto } from '../../presentation/dtos/create-personal-account.dto'; // Adjust the path
import { UpdatePersonalAccountDto } from 'src/presentation/dtos/update-personal-account.dto';

@Injectable()
export class PersonalAccountProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreatePersonalAccountDto,
        PersonalAccount,
        forMember(
          (destination) => destination.first_name,
          mapFrom((src) => src.firstName),
        ),
        forMember(
          (destination) => destination.email_address,
          mapFrom((src) => src.emailAddress),
        ),
        forMember(
          (destination) => destination.surname,
          mapFrom((src) => src.surname),
        ),
        forMember(
          (destination) => destination.phone_number,
          mapFrom((src) => src.phoneNumber),
        ),
        forMember(
          (destination) => destination.country,
          mapFrom((src) => src.country),
        ),
        forMember(
          (destination) => destination.date_of_birth,
          mapFrom((src) => src.dateOfBirth),
        ),
        forMember(
          (destination) => destination.national_id,
          mapFrom((src) => src.nationalId),
        ),
        forMember(
          (destination) => destination.gender,
          mapFrom((src) => src.gender),
        ),
        forMember(
          (destination) => destination.profile_image,
          mapFrom((src) => src.profile_image),
        ),
        forMember(
          (destination) => destination.status,
          mapFrom(() => new AccountStatus('active')),
        ),
        forMember(
          (destination) => destination.is_verified,
          mapFrom(() => false),
        ),
        forMember(
          (destination) => destination.is_email_verified,
          mapFrom(() => false),
        ),
        forMember(
          (destination) => destination.is_phone_number_verified,
          mapFrom(() => false),
        ),
        forMember(
          (destination) => destination.created_date,
          mapFrom(() => new Date()),
        ),
        forMember(
          (destination) => destination.updated_date,
          mapFrom(() => new Date()),
        ),
      );

      createMap(
        mapper,
        CreatePersonalAccountDto,
        User,
        forMember(
          (destination) => destination.user_name,
          mapFrom((src: CreatePersonalAccountDto) => src.emailAddress),
        ),
        forMember(
          (destination) => destination.password,
          mapFrom((src: CreatePersonalAccountDto) => src.password),
        ),

        forMember(
          (destination) => destination.is_active,
          mapFrom(() => false),
        ),
        forMember(
          (destination) => destination.created_date,
          mapFrom(() => new Date()),
        ),
        forMember(
          (destination) => destination.updated_date,
          mapFrom(() => new Date()),
        ),
      );

      createMap(
        mapper,
        CreateRoleDto,
        Role,
        forMember(
          (destination) => destination.name,
          mapFrom((src: CreateRoleDto) => src.name),
        ),
        forMember(
          (destination) => destination.description,
          mapFrom((src: CreateRoleDto) => src.description),
        ),
      );

      createMap(
        mapper,
        UpdatePersonalAccountDto,
        PersonalAccount,
        forMember(
          (destination) => destination.first_name,
          mapFrom((src) => src.firstName),
        ),
        forMember(
          (destination) => destination.surname,
          mapFrom((src) => src.surname),
        ),
        forMember(
          (destination) => destination.email_address,
          mapFrom((src) => src.emailAddress),
        ),
        forMember(
          (destination) => destination.phone_number,
          mapFrom((src) => src.phoneNumber),
        ),
        forMember(
          (destination) => destination.country,
          mapFrom((src) => src.country),
        ),
        forMember(
          (destination) => destination.date_of_birth,
          mapFrom((src) => src.dateOfBirth),
        ),
        forMember(
          (destination) => destination.gender,
          mapFrom((src) => src.gender),
        ),
        forMember(
          (destination) => destination.national_id,
          mapFrom((src) => src.nationalId),
        ),
        forMember(
          (destination) => destination.profile_image,
          mapFrom((src) => src.profile_image),
        ),
        forMember(
          (destination) => destination.updated_date,
          mapFrom(() => new Date()),
        ),
      );
    };
  }
}
