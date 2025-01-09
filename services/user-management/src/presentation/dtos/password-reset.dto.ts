import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PasswordResetDto {
  @ApiProperty({
    description:
      'The token sent to the user for verifying the password reset request',
    example: 'abcdef123456',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'The new password the user wants to set',
    example: 'newPassword123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  newPassword: string;

  @ApiProperty({
    description: 'The confirmation of the new password',
    example: 'newPassword123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  confirmPassword: string;
}
