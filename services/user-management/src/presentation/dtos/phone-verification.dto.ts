import { IsNotEmpty, IsString } from 'class-validator';

export class PhoneVerificationDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  verificationCode: string;
}
