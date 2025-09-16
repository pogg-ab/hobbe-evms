import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AdminAlertType, AdminAlertSeverity } from 'src/domain/entities/admin-alert.entity';

export class CreateAdminAlertDto {
  @ApiProperty({ example: 'New Event Pending Approval' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Fired when an organizer submits an event for review.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: AdminAlertType, example: AdminAlertType.EVENT_LIFECYCLE })
  @IsEnum(AdminAlertType)
  alert_type: AdminAlertType;

  @ApiProperty({ enum: AdminAlertSeverity, example: AdminAlertSeverity.MEDIUM })
  @IsEnum(AdminAlertSeverity)
  severity: AdminAlertSeverity;

 
  @ApiPropertyOptional({ 
    description: 'Set to true to make this a global broadcast for all users.',
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  is_broadcast?: boolean;
}