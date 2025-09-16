import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { AdminAlertType, AdminAlertSeverity } from 'src/domain/entities/admin-alert.entity';

export class UpdateAdminAlertDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: AdminAlertType, required: false })
  @IsEnum(AdminAlertType)
  @IsOptional()
  alert_type?: AdminAlertType;

  @ApiProperty({ enum: AdminAlertSeverity, required: false })
  @IsEnum(AdminAlertSeverity)
  @IsOptional()
  severity?: AdminAlertSeverity;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}