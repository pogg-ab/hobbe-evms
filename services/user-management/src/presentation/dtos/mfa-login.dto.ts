import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';

export class MfaLoginDto {
  @ApiProperty({
    description: 'The short-lived token received from the initial login step.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  interimToken: string;

  @ApiProperty({
    description: 'The 6-digit code from the user\'s authenticator app.',
    example: '123456',
  })
  @IsNumberString()
  @Length(6, 6)
  @IsNotEmpty()
  mfaCode: string;
}