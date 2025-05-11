import { EntityManager } from 'typeorm';
import { SocialMedia } from '../entities/social-media.entity';

export interface ISocialMediaRepository {
  create(manager: EntityManager, socialMedia: SocialMedia): Promise<SocialMedia>;
  findOneById(socialMediaId: string): Promise<SocialMedia | null>;
  findByOrganizerId(organizationalAccountId: string): Promise<SocialMedia[]>;
  update(socialMediaId: string, socialMedia: SocialMedia): Promise<SocialMedia>;
  remove(socialMediaId: string): Promise<void>;
}
