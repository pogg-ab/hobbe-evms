import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyMfaSetupDto {
  @ApiProperty({
    description: 'The short-lived setup token received from the login endpoint.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsJWT()
  @IsNotEmpty()
  setupToken: string;

  @ApiProperty({
    description: 'The 6-digit code from the authenticator app.',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  mfaCode: string;
}