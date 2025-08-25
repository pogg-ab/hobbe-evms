import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateMfaSettingDto {
  @ApiProperty({
    description: 'The new state for the system-wide MFA requirement.',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isEnabled: boolean;
}