import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateOrganizationalAccountDto } from './create-organizational-account.dto';
import { SocialMediaAccountDto } from './social-media-account.dto';

export class UpdateOrganizationalAccountDto extends PartialType(
  CreateOrganizationalAccountDto,
) {
  @ApiProperty({
    description: 'The name of the company',
    example: 'Tech Corp',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'The address of the company',
    example: '123 Tech St, Silicon Valley',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  companyAddress: string;

  @ApiProperty({
    description: 'The phone number of the company',
    example: '+1234567890',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  companyPhoneNumber: string;

  @ApiProperty({
    description: 'The email address of the company',
    example: 'contact@techcorp.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  companyEmail: string;

  @ApiProperty({
    description: 'The type of company (e.g., LLC, Corporation)',
    example: 'LLC',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  companyType: string;

  @ApiProperty({
    description: 'The Tax Identification Number (TIN) of the company',
    example: '123-45-6789',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  TIN: string;

  @ApiProperty({
    description: 'The country where the company operates',
    example: 'USA',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  operatingCountry: string;

  @ApiProperty({
    description: 'The status of the organizational account',
    example: 'Active',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'The company logo image (base64 encoded)',
    example: 'data:image/png;base64,...',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyLogo?: string;

  @ApiProperty({
    description: 'The business license image (base64 encoded)',
    example: 'data:image/png;base64,...',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessLicense?: string;

  @ApiProperty({
    description: 'The business certificate image (base64 encoded)',
    example: 'data:image/png;base64,...',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessCertificate?: string;

  @ApiProperty({
    description: 'The memorandum of association image (base64 encoded)',
    example: 'data:image/png;base64,...',
    required: false,
  })
  @IsOptional()
  @IsString()
  memorandumOfAssociation?: string;

  @ApiProperty({
    description: 'Proof of address document (base64 encoded)',
    example: 'data:image/png;base64,...',
    required: false,
  })
  @IsOptional()
  @IsString()
  proofOfAddress?: string;

  @ApiProperty({
    description: 'The first name of the owner',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  ownerFirstName?: string;

  @ApiProperty({
    description: 'The surname of the owner',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  ownerSurName?: string;

  @ApiProperty({
    description: 'The email address of the owner',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  ownerEmail?: string;

  @ApiProperty({
    description: 'The phone number of the owner',
    example: '+2519123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  ownerPhoneNumber?: string;

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
