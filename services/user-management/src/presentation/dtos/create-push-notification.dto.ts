import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePushNotificationDto {
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsEnum(['ALERT', 'INFO', 'UPDATE', 'PROMOTIONAL'])
  message_type?: 'ALERT' | 'INFO' | 'UPDATE' | 'PROMOTIONAL';

  @IsOptional()
  @IsEnum(['IOS', 'ANDROID'])
  platform?: 'IOS' | 'ANDROID';

  @IsOptional()
  @IsEnum(['SENT', 'FAILED', 'PENDING'])
  status?: 'SENT' | 'FAILED' | 'PENDING';

  @IsOptional()
  @IsInt()
  priority?: number;
}
