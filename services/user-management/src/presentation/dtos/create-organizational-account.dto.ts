import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SocialMediaAccountDto } from './social-media-account.dto';

export class CreateOrganizationalAccountDto {
  @ApiProperty({ description: 'The name of the company', example: 'Tech Corp' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'The address of the company',
    example: '123 Tech St, Silicon Valley',
  })
  @IsString()
  @IsNotEmpty()
  companyAddress: string;

  @ApiProperty({
    description: 'The phone number of the company',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  companyPhoneNumber: string;

  @ApiProperty({
    description: 'The email address of the company',
    example: 'contact@techcorp.com',
  })
  @IsEmail()
  @IsNotEmpty()
  companyEmail: string;

  @ApiProperty({
    description: 'The type of company (e.g., LLC, Corporation)',
    example: 'LLC',
  })
  @IsString()
  @IsNotEmpty()
  companyType: string;

  @ApiProperty({
    description: 'The Tax Identification Number (TIN) of the company',
    example: '123-45-6789',
  })
  @IsString()
  @IsNotEmpty()
  TIN: string;

  @ApiProperty({
    description: 'The country where the company operates',
    example: 'USA',
  })
  @IsString()
  @IsNotEmpty()
  operatingCountry: string;

  @ApiProperty({
    description: 'The status of the organizational account',
    example: 'Active',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'The company logo image (base64 encoded)',
    example: 'data:image/png;base64,...',
  })
  @IsOptional()
  @IsString()
  companyLogo?: string;

  @ApiProperty({
    description: 'The business license image (base64 encoded)',
    example: 'data:image/png;base64,...',
  })
  @IsOptional()
  @IsString()
  businessLicense?: string;

  @ApiProperty({
    description: 'The business certificate image (base64 encoded)',
    example: 'data:image/png;base64,...',
  })
  @IsOptional()
  @IsString()
  businessCertificate?: string;

  @ApiProperty({
    description: 'The memorandum of association image (base64 encoded)',
    example: 'data:image/png;base64,...',
  })
  @IsOptional()
  @IsString()
  memorandumOfAssociation?: string;

  @ApiProperty({
    description: 'Proof of address document (base64 encoded)',
    example: 'data:image/png;base64,...',
  })
  @IsOptional()
  @IsString()
  proofOfAddress?: string;

  @ApiProperty({ description: 'The first name of the owner', example: 'John' })
  @IsString()
  @IsNotEmpty()
  ownerFirstName: string;

  @ApiProperty({ description: 'The surname of the owner', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  ownerSurName: string;

  @ApiProperty({
    description: 'The email address of the owner',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  ownerEmail: string;

  @ApiProperty({
    description: 'The phone number of the owner',
    example: '+2519123456',
  })
  @IsString()
  @IsNotEmpty()
  ownerPhoneNumber: string;

  @ApiProperty({
    description: 'The list of social media platforms and their URLs',
    example: [
      { platform: 'Facebook', url: 'https://facebook.com/techcorp' },
      { platform: 'Twitter', url: 'https://twitter.com/techcorp' },
    ],
    type: [SocialMediaAccountDto],
  })
  @IsArray()
  @IsOptional()
  socialMediaAccounts?: SocialMediaAccountDto[];
}
