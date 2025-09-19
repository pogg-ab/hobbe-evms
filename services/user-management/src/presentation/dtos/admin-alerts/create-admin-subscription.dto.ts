
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAdminSubscriptionDto {
  @ApiProperty({ description: 'The UUID of the admin to subscribe to the alert.' })
  @IsUUID()
  @IsNotEmpty()
  adminId: string;
}