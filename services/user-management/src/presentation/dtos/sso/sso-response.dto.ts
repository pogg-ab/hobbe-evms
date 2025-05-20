import { ApiProperty } from '@nestjs/swagger';
import { GoogleUserDto } from './google-user.dto';

export class SSOResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @ApiProperty({
    description: 'User information',
    type: GoogleUserDto
  })
  user: GoogleUserDto;
} 