import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsPhoneNumber,
  IsStrongPassword,
} from 'class-validator';
import { IsEqualTo } from '../decorators/is-equal-to.decorator';

export class UpdatePersonalAccountDto {
  @ApiProperty({ description: 'The first name of the user', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'The surname of the user', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  surname: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  emailAddress: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+123456789',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ description: 'The country of the user', example: 'USA' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'The date of birth of the user (YYYY-MM-DD)',
    example: '1990-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ description: 'The gender of the user', example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({
    description: 'The national ID of the user',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({
    description: 'Base64 encoded national ID image',
    example: 'data:image/png;base64,...',
  })
  @IsOptional()
  @IsString()
  nationalIdImage?: string;

  @ApiProperty({
    description: 'URL or base64 image of the profile',
    example: 'data:image/png;base64,...',
  })
  @IsOptional()
  @IsString()
  profile_image?: string;


}
