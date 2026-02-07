import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { SocialMediaAccountDto } from './social-media-account.dto';
import { UserID } from 'src/domain/value-objects/user-id.value-object';

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
    description: 'Enter password',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'Confirm Password',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  confirmPassword: string;

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

  @ApiProperty({
    description: 'Indicates whether this is the primary account',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPrimaryAccount: boolean = true;

  @ApiProperty({
    description:
      'The UUID of the primary account this secondary account is associated with. Required if isPrimaryAccount is false.',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @ValidateIf((o) => o.isPrimaryAccount === false)
  @IsUUID()
  @IsNotEmpty()
  primaryAccount?: UserID;
}
