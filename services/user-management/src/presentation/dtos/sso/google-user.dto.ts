import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleUserDto {
  @ApiProperty({
    description: 'User email from Google account',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User first name from Google account',
    example: 'John'
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'User last name from Google account',
    example: 'Doe'
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({
    description: 'User profile picture URL from Google account',
    example: 'https://lh3.googleusercontent.com/a-/AOh14Gj...'
  })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiProperty({
    description: 'Google account ID',
    example: '123456789'
  })
  @IsString()
  @IsNotEmpty()
  googleId: string;

  @ApiProperty({
    description: 'Google OAuth2 access token',
    example: 'ya29.a0AfB_byC...'
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
} 