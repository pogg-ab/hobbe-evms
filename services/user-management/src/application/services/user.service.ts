import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import { SearchFilters } from 'src/presentation/dtos/search-filters.dto';
import { ElasticsearchConfig } from 'src/infrastructure/elasticsearch/elasticsearch.config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class UserService {
  private readonly client: Client;
  private readonly logger = new Logger(ElasticsearchConfig.name);

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
    private readonly elasticsearchConfig: ElasticsearchConfig,
  ) {
    this.client = elasticsearchConfig.getClient();
  }

  async findUserById(userId: string): Promise<any | null> {
    const user = await this.userRepository.findByIdWithAccountInfo(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async getUserInfo(userIds: string[]): Promise<Record<string, any>> {
    if (!userIds || userIds.length === 0) {
      return {};
    }

    const userInfoMap: Record<string, any> = {};
    const errors: string[] = [];

    await Promise.all(
      userIds.map(async (userId) => {
        try {
          const user = await this.findUserById(userId);
          if (user) {
            userInfoMap[userId] = user;
          }
        } catch (error) {
          errors.push(`Failed to fetch user ${userId}: ${error.message}`);
        }
      }),
    );

    if (errors.length > 0) {
      console.warn('Partial errors fetching user info:', errors);
    }

    return userInfoMap;
  }

  async findAllUsers(page: number, limit: number): Promise<any | null> {
    return await this.userRepository.findAllUsers(page, limit);
  }

  async update(userId: UserID, updateUserDto: UpdateUserDto): Promise<any> {
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
        await this.personalAccountRepository.update(
          existingUser.account_info.personal_account_id,
          updatedPersonalAccount,
        );
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

          const organizationalAccount =
            await this.organizationalAccountRepository.update(
              existingUser.account_info.organizational_account_id,
              updatedOrganizationalAccount,
            );

          if (
            updateUserDto.organizationalAccount.ownerFirstName ||
            updateUserDto.organizationalAccount.ownerSurName
          ) {
            const updatedOwner = this.mapper.map(
              updateUserDto.organizationalAccount,
              UpdateOrganizationalAccountDto,
              Owner,
            );
            const ownerJsonString = JSON.stringify(organizationalAccount.owner);

            const ownerJson = JSON.parse(ownerJsonString);
            await this.ownerRepository.update(ownerJson.owner_id, updatedOwner);
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
            await this.kycRepository.update(kycJson.kyc_id, updatedKYC);
          }

          if (updateUserDto.organizationalAccount.socialMediaAccounts) {
            await this.updateSocialMedia(
              organizationalAccount,
              updateUserDto.organizationalAccount.socialMediaAccounts,
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

    await this.userRepository.update(updatedUser);
    const { password, ...userWithoutPassword } = updatedUser;
    return {
      message: 'User updated successfully',
      user: userWithoutPassword,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  private async updateSocialMedia(
    organizationalAccount: OrganizationalAccount,
    socialMediaUpdates: SocialMediaAccountDto[],
  ): Promise<void> {
    const existingSocialMedia =
      await this.socialMediaRepository.findByOrganizerId(
        organizationalAccount.organizational_account_id.toString(),
      );

    const existingSocialMediaMap = new Map(
      existingSocialMedia.map((sm) => [sm.platform, sm]),
    );

    const updatedSocialMedia: SocialMedia[] = [];

    for (const smDto of socialMediaUpdates) {
      const existing = existingSocialMediaMap.get(smDto.platform);
      if (existing) {
        const updatedEntity = this.mapper.map(
          smDto,
          SocialMediaAccountDto,
          SocialMedia,
        );

        updatedEntity.social_media_id = existing.social_media_id;
        updatedEntity.organizational_account = existing.organizational_account;

        updatedSocialMedia.push(updatedEntity);
        existingSocialMediaMap.delete(smDto.platform);
      } else {
        const newSocialMedia = this.mapper.map(
          smDto,
          SocialMediaAccountDto,
          SocialMedia,
        );
        newSocialMedia.organizational_account =
          organizationalAccount.organizational_account_id;
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
      await this.socialMediaRepository.update(
        sm.social_media_id.toString(),
        sm,
      );
    }
  }

  async searchUsers(
    searchTerm: string,
    filters: SearchFilters,
    page: number,
    limit: number,
  ): Promise<any | null> {
    const users = await this.userRepository.search(
      searchTerm,
      filters,
      page,
      limit,
    );

    if (!users || users.length === 0) {
      throw new NotFoundException(
        'No users found matching your search criteria',
      );
    }

    return users;
  }

  async reindexAllUsers() {
    const BATCH_SIZE = parseInt(process.env.BULK_SIZE) || 1000;
    const users = await this.userRepository.findAllUsersOnly();

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      const bulkBody = batch.flatMap((user) => [
        { index: { _index: 'users', _id: user.user_id.toString() } },
        {
          user_id: user.user_id,
          user_name: user.user_name,
          profile_id: user.profile_id,
          profile_name: user.profile_name,
          isActive: user.is_active,
        },
      ]);

      if (bulkBody.length > 0) {
        try {
          const result = await this.client.bulk({ body: bulkBody });

          if (result.errors) {
            this.logger.log('Error during reindexing:', result.errors);
          } else {
            this.logger.log(
              `Batch from ${i + 1} to ${i + batch.length} reindexed successfully.`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error performing bulk reindex for batch starting at ${i + 1}:`,
            error,
          );
        }
      }
    }

    this.logger.log('Reindexing process completed.');
  }

  async findActiveUsers(page: number, limit: number): Promise<any | null> {
    return await this.userRepository.findActiveUsers(page, limit);
  }

  async onModuleInit() {
    this.createIndexWithEdgeNGram();
    this.reindexAllUsers();
  }

  private async createIndexWithEdgeNGram() {
    const indexName = 'users';

    try {
      const exists = await this.client.indices.exists({ index: indexName });
      if (!exists) {
        await this.client.indices.create({
          index: indexName,
          body: {
            settings: {
              analysis: {
                tokenizer: {
                  edge_ngram_tokenizer: {
                    type: 'edge_ngram',
                    min_gram: 1,
                    max_gram: 25,
                    token_chars: ['letter', 'digit'],
                  },
                },
                analyzer: {
                  edge_ngram_analyzer: {
                    type: 'custom',
                    tokenizer: 'edge_ngram_tokenizer',
                  },
                },
              },
            },
            mappings: {
              properties: {
                user_name: {
                  type: 'text',
                  analyzer: 'edge_ngram_analyzer',
                },
              },
            },
          },
        });
        this.logger.log('Index created with Edge N-Gram analyzer');
      } else {
        this.logger.log('Index already exists');
      }
    } catch (error) {
      this.logger.error('Error creating index:', error.stack);
    }
  }
}
