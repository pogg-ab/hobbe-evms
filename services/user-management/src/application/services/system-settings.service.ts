import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemSetting } from 'src/domain/entities/system-setting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
  ) {}

  /**
   * Updates the system-wide MFA requirement.
   * @param isEnabled The new state for the MFA requirement.
   */
  async updateMfaRequirement(isEnabled: boolean): Promise<SystemSetting> {
    const key = 'MFA_REQUIRED';
    const mfaSetting = await this.systemSettingRepository.findOne({ where: { key } });

    if (!mfaSetting) {
      // This should ideally not happen because our seeder creates it.
      // But it's good practice to handle this case.
      throw new NotFoundException(`System setting with key '${key}' not found.`);
    }

    mfaSetting.value = isEnabled.toString(); // Store as 'true' or 'false'

    try {
      return await this.systemSettingRepository.save(mfaSetting);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update system setting.');
    }
  }

  /**
   * Retrieves the current system-wide MFA requirement setting.
   */
  async getMfaRequirement(): Promise<SystemSetting> {
    const key = 'MFA_REQUIRED';
    const mfaSetting = await this.systemSettingRepository.findOne({ where: { key } });

    if (!mfaSetting) {
      throw new NotFoundException(`System setting with key '${key}' not found.`);
    }

    return mfaSetting;
  }
}