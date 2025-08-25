import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, Length } from 'class-validator';

export class EnableMfaDto {
  @ApiProperty({
    description: 'The 6-digit verification code from the authenticator app.',
    example: '123456',
  })
  @IsNumberString()
  @Length(6, 6)
  @IsNotEmpty()
  token: string;
}