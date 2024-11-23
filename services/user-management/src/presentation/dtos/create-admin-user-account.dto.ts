import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateAdminUserAccountDto {
  @ApiProperty({
    description: 'The first name of the admin user',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'The last name of the admin user',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'The email address of the admin user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  emailAddress: string;

  @ApiProperty({
    description: 'The phone number of the admin user',
    example: '+123456789',
  })
  @IsPhoneNumber(null)
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'The profile image of the admin user',
    example: 'data:image/png;base64,...',
  })
  @IsOptional()
  @IsString()
  profile_image?: string;
}
