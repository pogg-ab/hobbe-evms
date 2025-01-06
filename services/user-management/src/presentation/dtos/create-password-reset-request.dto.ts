import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class PasswordResetRequestDto {
  @ApiProperty({
    description: "The email address of the user requesting password reset",
    example: "user@example.com",
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  user_name: string;
}
