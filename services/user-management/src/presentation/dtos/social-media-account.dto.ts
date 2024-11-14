import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SocialMediaAccountDto {
  @ApiProperty({
    description: 'The social media platform name',
    example: 'Facebook',
  })
  @IsString()
  platform: string;

  @ApiProperty({
    description: 'The URL of the social media platform',
    example: 'https://facebook.com/techcorp',
  })
  @IsString()
  url: string;
}
