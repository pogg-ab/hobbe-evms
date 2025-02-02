import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { User } from 'src/domain/entities/user.entity';
import { IOrganizationalAccountRepository } from 'src/domain/repositories/organizational-account.repository';
import { ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/organizational-account.repository.token';
import { IPersonalAccountRepository } from 'src/domain/repositories/personal-account.repository';
import { PERSONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/personal-account.repository.token';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { UserID } from 'src/domain/value-objects/user-id.value-object';
import { UpdateOrganizationalAccountDto } from 'src/presentation/dtos/update-organizational-account.dto';
import { UpdatePersonalAccountDto } from 'src/presentation/dtos/update-personal-account.dto';
import { UpdateUserDto } from 'src/presentation/dtos/update-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DataSource } from 'typeorm';
import { Owner } from 'src/domain/entities/owner.entity';
import { OWNER_REPOSITORY_TOKEN } from 'src/domain/repositories/owner.repository.token';
import { IOwnerRepository } from 'src/domain/repositories/owner.repository';
import { KYC_REPOSITORY_TOKEN } from 'src/domain/repositories/kyc.repository.token';
import { IKYCRepository } from 'src/domain/repositories/kyc.repository';
import { SOCIAL_MEDIA_REPOSITORY_TOKEN } from 'src/domain/repositories/social-media.repository.token';
import { ISocialMediaRepository } from 'src/domain/repositories/social-media.repository';
import { KYC } from 'src/domain/entities/kyc.entity';
import { SocialMedia } from 'src/domain/entities/social-media.entity';

@Injectable()
export class UserService {
    constructor(
        @Inject(USER_REPOSITORY_TOKEN)
        private readonly userRepository: IUserRepository,
        @Inject(PERSONAL_ACCOUNT_REPOSITORY_TOKEN)
        private readonly personalAccountRepository: IPersonalAccountRepository,
        @Inject(ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN)
        private readonly organizationalAccountRepository: IOrganizationalAccountRepository,
        @Inject(OWNER_REPOSITORY_TOKEN)
        private readonly ownerRepository: IOwnerRepository,

        @Inject(KYC_REPOSITORY_TOKEN)
        private readonly kycRepository: IKYCRepository,

        @Inject(SOCIAL_MEDIA_REPOSITORY_TOKEN)
        private readonly socialMediaRepository: ISocialMediaRepository,
        @InjectMapper() private readonly mapper: Mapper,
        private dataSource: DataSource,


    ) { }


    async findUserById(userId: string): Promise<User> {
        const user = await this.userRepository.findByIdWithAccountInfo(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        return user;
    }

    async findAllUsers(): Promise<any | null> {
        return await this.userRepository.findAllUsers();
    }

    async update(userId: UserID, updateUserDto: UpdateUserDto): Promise<User> {
        const existingUser = await this.findUserById(userId.toString());

        if (!existingUser) {
            throw new HttpException(
                `User with ID ${userId} not found`,
                HttpStatus.NOT_FOUND,
            );
        }

        if (updateUserDto.password) {
            updateUserDto.password = await this.hashPassword(updateUserDto.password);
        }

        const updatedUser = this.mapper.map(updateUserDto, UpdateUserDto, User);
        updatedUser.user_id = userId;

        if (updateUserDto.accountType === 'personal') {
            if (updateUserDto.personalAccount) {
                const updatedPersonalAccount = this.mapper.map(
                    updateUserDto.personalAccount,
                    UpdatePersonalAccountDto,
                    PersonalAccount,
                );
                await this.personalAccountRepository.update(existingUser.personal_account, updatedPersonalAccount);
            }
        } else if (updateUserDto.accountType === 'organizational') {
            if (updateUserDto.organizationalAccount) {
                const queryRunner = await this.dataSource.createQueryRunner();
                await queryRunner.startTransaction();

                try {
                    const updatedOrganizationalAccount = this.mapper.map(
                        updateUserDto.organizationalAccount,
                        UpdateOrganizationalAccountDto,
                        OrganizationalAccount,
                    );
                    console.log(existingUser.organizational_account)


                    await this.organizationalAccountRepository.update(
                        existingUser.organizational_account,
                        updatedOrganizationalAccount,
                    );

                    if (updateUserDto.organizationalAccount.ownerFirstName || updateUserDto.organizationalAccount.ownerSurName) {
                        const updatedOwner = this.mapper.map(
                            updateUserDto.organizationalAccount,
                            UpdateOrganizationalAccountDto,
                            Owner,
                        );
                        console.log(updatedOwner.owner_id)
                        await this.ownerRepository.update(
                            updatedOwner.owner_id.toString(),
                            updatedOwner,
                        );
                    }

                    if (
                        updateUserDto.organizationalAccount.companyLogo ||
                        updateUserDto.organizationalAccount.businessLicense ||
                        updateUserDto.organizationalAccount.proofOfAddress
                    ) {
                        const updatedKYC = this.mapper.map(
                            updateUserDto.organizationalAccount,
                            UpdateOrganizationalAccountDto,
                            KYC,
                        );
                        await this.kycRepository.update(
                            updatedKYC.kyc_id.toString(),
                            updatedKYC,
                        );
                    }

                    if (updateUserDto.organizationalAccount.socialMediaAccounts) {
                        const updatedSocialMedia = this.mapper.map(
                            updateUserDto.organizationalAccount,
                            UpdateOrganizationalAccountDto,
                            SocialMedia,
                        );
                        updatedSocialMedia.organizational_account =
                            existingUser.organizational_account;

                        await this.socialMediaRepository.update(
                            updatedSocialMedia.social_media_id.toString(),
                            updatedSocialMedia,
                        );
                    }

                    await queryRunner.commitTransaction();
                } catch (error) {
                    await queryRunner.rollbackTransaction();
                    throw error;
                } finally {
                    await queryRunner.release();
                }
            }
        }


        return await this.userRepository.update(updatedUser);
    }

    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }


}
