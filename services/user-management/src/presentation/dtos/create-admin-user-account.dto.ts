import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsArray,       // <-- IMPORT
  IsUUID,        // <-- IMPORT
  ArrayNotEmpty, // <-- IMPORT
} from 'class-validator';

export class CreateAdminUserAccountDto {
  @ApiProperty({ description: 'The first name of the admin user', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'The last name of the admin user', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'The email address of the admin user', example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  emailAddress: string;

  @ApiProperty({ description: 'The phone number of the admin user', example: '+123456789' })
  @IsPhoneNumber(null)
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ description: 'The profile image of the admin user', example: 'data:image/png;base64,...', required: false })
  @IsOptional()
  @IsString()
  profile_image?: string;

  /**
   * --- THIS IS THE NEW REQUIRED PROPERTY ---
   * A Super Admin must provide at least one role ID when creating a new user.
   */
  @ApiProperty({
    description: 'An array of Role UUIDs to assign to the new user',
    example: ['c733371d-51df-436c-b93d-95b663992e40'],
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  roleIds: string[];
}