import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({
    description: 'The username of the user who is requesting the OTP resend',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  user_name: string;
}
