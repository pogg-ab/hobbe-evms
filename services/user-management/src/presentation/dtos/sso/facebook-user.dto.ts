import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FacebookUserDto {
  @ApiProperty({
    description: 'User email from Facebook account',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User display name from Facebook account',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiPropertyOptional({
    description: 'User profile picture URL from Facebook account',
    example: 'https://platform-lookaside.fbsbx.com/platform/profilepic/...'
  })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiProperty({
    description: 'Facebook account ID',
    example: '123456789'
  })
  @IsString()
  @IsNotEmpty()
  facebookId: string;

  @ApiProperty({
    description: 'Facebook OAuth2 access token',
    example: 'EAA...'
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
} 