import { SocialMedia } from '../entities/social-media.entity';

export interface ISocialMediaRepository {
  create(socialMedia: SocialMedia): Promise<SocialMedia>;
  findOneById(socialMediaId: string): Promise<SocialMedia | null>;
  update(socialMediaId: string, socialMedia: SocialMedia): Promise<SocialMedia>;
  remove(socialMediaId: string): Promise<void>;
}
