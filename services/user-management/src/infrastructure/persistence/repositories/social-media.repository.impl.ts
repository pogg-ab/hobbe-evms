import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialMedia } from 'src/domain/entities/social-media.entity';
import { ISocialMediaRepository } from 'src/domain/repositories/social-media.repository';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class SocialMediaRepositoryImpl implements ISocialMediaRepository {
  constructor(
    @InjectRepository(SocialMedia)
    private readonly socialMediaRepository: Repository<SocialMedia>,
  ) {}

  async create(
    manager: EntityManager,
    socialMedia: SocialMedia,
  ): Promise<SocialMedia> {
    try {
      const newSocialMedia = this.socialMediaRepository.create(socialMedia);
      return await manager.save(newSocialMedia);
    } catch (error) {
      throw new HttpException(
        `Error creating Social Media: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneById(socialMediaId: string): Promise<SocialMedia | null> {
    try {
      return await this.socialMediaRepository.findOne({
        where: { social_media_id: socialMediaId },
      });
    } catch (error) {
      throw new HttpException(
        `Error fetching Social Media: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByOrganizerId(
    organizationalAccountId: string,
  ): Promise<SocialMedia[]> {
    try {
      return await this.socialMediaRepository.find({
        where: { organizational_account: organizationalAccountId },
      });
    } catch (error) {
      throw new HttpException(
        `Error fetching Social Media by organizer ID: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    socialMediaId: string,
    socialMedia: SocialMedia,
  ): Promise<SocialMedia> {
    try {
      await this.socialMediaRepository.update(socialMediaId, socialMedia);
      return await this.socialMediaRepository.findOne({
        where: { social_media_id: socialMediaId },
      });
    } catch (error) {
      throw new HttpException(
        `Error updating Social Media: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(socialMediaId: string): Promise<void> {
    try {
      await this.socialMediaRepository.delete(socialMediaId);
    } catch (error) {
      throw new HttpException(
        `Error deleting Social Media: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
