import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { KYC } from 'src/domain/entities/kyc.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { Owner } from 'src/domain/entities/owner.entity';
import { SocialMedia } from 'src/domain/entities/social-media.entity';
import { User } from 'src/domain/entities/user.entity';
import { AccountStatus } from 'src/domain/value-objects/account-status.value-object';
import { CreateOrganizationalAccountDto } from 'src/presentation/dtos/create-organizational-account.dto';

@Injectable()
export class OrganizationalAccountProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateOrganizationalAccountDto,
        OrganizationalAccount,
        forMember(
          (destination) => destination.company_name,
          mapFrom((src) => src.companyName),
        ),
        forMember(
          (destination) => destination.company_address,
          mapFrom((src) => src.companyAddress),
        ),
        forMember(
          (destination) => destination.company_phone_number,
          mapFrom((src) => src.companyPhoneNumber),
        ),
        forMember(
          (destination) => destination.company_email,
          mapFrom((src) => src.companyEmail),
        ),
        forMember(
          (destination) => destination.company_type,
          mapFrom((src) => src.companyType),
        ),
        forMember(
          (destination) => destination.TIN,
          mapFrom((src) => src.TIN),
        ),
        forMember(
          (destination) => destination.operating_country,
          mapFrom((src) => src.operatingCountry),
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
        CreateOrganizationalAccountDto,
        Owner,
        forMember(
          (destination) => destination.owner_first_name,
          mapFrom((src) => src.ownerFirstName),
        ),
        forMember(
          (destination) => destination.owner_sur_name,
          mapFrom((src) => src.ownerSurName),
        ),
        forMember(
          (destination) => destination.owner_email,
          mapFrom((src) => src.ownerEmail),
        ),
        forMember(
          (destination) => destination.owner_phone_number,
          mapFrom((src) => src.ownerPhoneNumber),
        ),
        forMember(
          (destination) => destination.is_email_verified,
          mapFrom(() => false),
        ),
        forMember(
          (destination) => destination.is_phone_number_verified,
          mapFrom(() => false),
        ),
      );

      createMap(
        mapper,
        CreateOrganizationalAccountDto,
        KYC,
        forMember(
          (destination) => destination.company_logo,
          mapFrom((src) => src.companyLogo),
        ),
        forMember(
          (destination) => destination.business_license,
          mapFrom((src) => src.businessLicense),
        ),
        forMember(
          (destination) => destination.business_certificate,
          mapFrom((src) => src.businessCertificate),
        ),
        forMember(
          (destination) => destination.memorandum_of_association,
          mapFrom((src) => src.memorandumOfAssociation),
        ),
        forMember(
          (destination) => destination.proof_of_address,
          mapFrom((src) => src.proofOfAddress),
        ),
        forMember(
          (destination) => destination.TIN,
          mapFrom((src) => src.TIN),
        ),
      );

      createMap(
        mapper,
        CreateOrganizationalAccountDto,
        SocialMedia,
        forMember(
          (destination) => destination.url,
          mapFrom((src) =>
            src.socialMediaAccounts ? src.socialMediaAccounts[0]?.url : '',
          ),
        ),
        forMember(
          (destination) => destination.platform,
          mapFrom((src) =>
            src.socialMediaAccounts ? src.socialMediaAccounts[0]?.platform : '',
          ),
        ),
      );

      createMap(
        mapper,
        CreateOrganizationalAccountDto,
        User,
        forMember(
          (destination) => destination.user_name,
          mapFrom((src) => src.companyEmail),
        ),
        // forMember(
        //   (destination) => destination.password,
        //   mapFrom( (src) => src.)),
        // ),
        forMember(
          (destination) => destination.is_active,
          mapFrom(() => true),
        ),
      );
    };
  }
}
