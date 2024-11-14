import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendEmailVerificationDto {
  @ApiProperty({
    description: 'The email address of the user requesting email verification',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email_address: string;
}
