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
import { SocialMediaAccountDto } from 'src/presentation/dtos/social-media-account.dto';

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


    async findUserById(userId: string): Promise<any | null> {
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


                    const organizationalAccount = await this.organizationalAccountRepository.update(
                        existingUser.account_info.organizational_account_id,
                        updatedOrganizationalAccount,
                    );

                    if (updateUserDto.organizationalAccount.ownerFirstName || updateUserDto.organizationalAccount.ownerSurName) {

                        const updatedOwner = this.mapper.map(
                            updateUserDto.organizationalAccount,
                            UpdateOrganizationalAccountDto,
                            Owner,
                        );
                        const ownerJsonString = JSON.stringify(organizationalAccount.owner);

                        const ownerJson = JSON.parse(ownerJsonString);
                        await this.ownerRepository.update(
                            ownerJson.owner_id,
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
                        const kycJsonString = JSON.stringify(organizationalAccount.kyc);

                        const kycJson = JSON.parse(kycJsonString);
                        await this.kycRepository.update(
                            kycJson.kyc_id,
                            updatedKYC,
                        );
                    }

                    if (updateUserDto.organizationalAccount.socialMediaAccounts) {
                        await this.updateSocialMedia(
                            organizationalAccount,
                            updateUserDto.organizationalAccount.socialMediaAccounts
                        );
                    }

                    // if (updateUserDto.organizationalAccount.socialMediaAccounts) {
                    //     const existingSocialMediaList = await this.socialMediaRepository.findByOrganizerId(
                    //         organizationalAccount.organizational_account_id.toString(),
                    //     );
                    //     if (existingSocialMediaList.length > 0) {
                    //         for (const socialMedia of existingSocialMediaList) {
                    //             const updatedSocialMedia = this.mapper.map(
                    //                 updateUserDto.organizationalAccount,
                    //                 UpdateOrganizationalAccountDto,
                    //                 SocialMedia,
                    //             );
                    //             updatedSocialMedia.organizational_account = existingUser.organizational_account;
                    //             await this.socialMediaRepository.update(
                    //                 socialMedia.social_media_id.toString(),
                    //                 updatedSocialMedia,
                    //             );
                    //         }
                    //     } else {
                    //         throw new HttpException(
                    //             `No Social Media accounts found for organizational account ID ${existingUser.organizational_account.organizational_account_id}.`,
                    //             HttpStatus.NOT_FOUND,
                    //         );
                    //     }
                    // }

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


    private async updateSocialMedia(
        organizationalAccount: OrganizationalAccount,
        socialMediaUpdates: SocialMediaAccountDto[]
    ): Promise<void> {
        const existingSocialMedia = await this.socialMediaRepository.findByOrganizerId(
            organizationalAccount.organizational_account_id.toString(),
        );

        const existingSocialMediaMap = new Map(
            existingSocialMedia.map((sm) => [sm.platform, sm])
        );

        const updatedSocialMedia: SocialMedia[] = [];

        for (const smDto of socialMediaUpdates) {
            const existing = existingSocialMediaMap.get(smDto.platform);
            if (existing) {
                const updatedEntity = this.mapper.map(smDto, SocialMediaAccountDto, SocialMedia);

                updatedEntity.social_media_id = existing.social_media_id;
                updatedEntity.organizational_account = existing.organizational_account;

                updatedSocialMedia.push(updatedEntity);
                existingSocialMediaMap.delete(smDto.platform);
            } else {
                const newSocialMedia = this.mapper.map(smDto, SocialMediaAccountDto, SocialMedia);
                newSocialMedia.organizational_account = organizationalAccount.organizational_account_id;
                updatedSocialMedia.push(newSocialMedia);
            }
        }

        const toDelete = Array.from(existingSocialMediaMap.values());
        if (toDelete.length > 0) {
            for (const sm of toDelete) {
                await this.socialMediaRepository.remove(sm.social_media_id.toString());
            }
        }
        
        for (const sm of updatedSocialMedia) {
            await this.socialMediaRepository.update(sm.social_media_id.toString(), sm);
        }
    }
}
