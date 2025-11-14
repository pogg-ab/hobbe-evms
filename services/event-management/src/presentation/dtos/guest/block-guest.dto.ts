import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class BlockGuestDto {
  @ApiPropertyOptional({
    description: 'ID of the event the guest belongs to',
    type: 'string',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Reason for blocking the guest' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
