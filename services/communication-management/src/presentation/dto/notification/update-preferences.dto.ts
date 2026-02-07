
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDefined, IsEnum, ValidateNested } from 'class-validator';
import { NotificationChannel } from 'src/domain/entities/notification-preference.entity';
import { NotificationType } from 'src/domain/entities/notification.entity';

class PreferenceSettingDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;
}

export class UpdatePreferencesDto {
  @ApiProperty({ type: [PreferenceSettingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreferenceSettingDto)
  @IsDefined()
  preferences: PreferenceSettingDto[];
}