import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class UnblockGuestDto {
    @ApiPropertyOptional({
        description: 'ID of the event the guest belongs to',
        type: 'string',
        format: 'uuid',
    })
    @IsOptional()
    @IsUUID()
    eventId?: string;
}
