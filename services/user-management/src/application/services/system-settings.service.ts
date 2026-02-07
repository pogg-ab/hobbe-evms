import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemSetting } from 'src/domain/entities/system-setting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
  ) {}

  async updateMfaRequirement(isEnabled: boolean): Promise<SystemSetting> {
    const key = 'MFA_REQUIRED';
    const mfaSetting = await this.systemSettingRepository.findOne({
      where: { key },
    });

    if (!mfaSetting) {
      throw new NotFoundException(
        `System setting with key '${key}' not found.`,
      );
    }

    mfaSetting.value = isEnabled.toString();

    try {
      return await this.systemSettingRepository.save(mfaSetting);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update system setting.',
      );
    }
  }

  async getMfaRequirement(): Promise<SystemSetting> {
    const key = 'MFA_REQUIRED';
    const mfaSetting = await this.systemSettingRepository.findOne({
      where: { key },
    });

    if (!mfaSetting) {
      throw new NotFoundException(
        `System setting with key '${key}' not found.`,
      );
    }

    return mfaSetting;
  }
}
