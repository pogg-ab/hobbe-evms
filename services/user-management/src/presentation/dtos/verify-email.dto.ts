import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'The email address of the user to be verified',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "The verification code sent to the user's email",
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  verificationCode: string;
}
