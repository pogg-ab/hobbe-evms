import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class PasswordResetVerifyDto {
  @ApiProperty({
    description: "The token sent to the user for verifying the password reset request",
    example: "abcdef123456",
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
