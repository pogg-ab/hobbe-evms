import { PartialType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { CreateAdminUserAccountDto } from './create-admin-user-account.dto';

export class UpdateAdminUserAccountDto extends PartialType(
  CreateAdminUserAccountDto,
) {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  emailAddress?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  profile_image?: string;
}
