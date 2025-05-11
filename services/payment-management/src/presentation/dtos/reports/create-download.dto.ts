import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class CreateDownloadDto {
  @ApiProperty({ description: "Platform", example: "android"})
  @IsIn(['android', 'ios', 'web', 'desktop'])
  platform: 'android' | 'ios' | 'web' | 'desktop';

  @ApiProperty({ description: "Device Type", example: "mobile"})
  @IsString()
  deviceType: string;


  @ApiProperty({ description: "OS Version", example: "14.0"})
  @IsString()
  osVersion: string;

  @ApiProperty({ description: "Country", example: "Ethiopia"})
  @IsString()
  country: string;
}
