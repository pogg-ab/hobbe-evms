import { ApiProperty } from '@nestjs/swagger';

export class CreateGuestSessionDto {
    @ApiProperty({
        description: 'Optional custom session identifier',
        required: false,
    })
    customId?: string;
}