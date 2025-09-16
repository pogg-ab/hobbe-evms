
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateUserSubscriptionDto {
  @ApiProperty({ description: 'The UUID of the user to subscribe to the alert.' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}