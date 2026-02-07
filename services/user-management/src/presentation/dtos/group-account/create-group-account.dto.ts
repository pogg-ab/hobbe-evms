import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateGroupAccountDto {
    @ApiProperty({ description: 'ID of the primary user (organizer)', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsNotEmpty()
    @IsUUID()
    primary_user_id: string;

    @ApiProperty({ description: 'ID of the linked user', example: '123e4567-e89b-12d3-a456-426614174001' })
    @IsNotEmpty()
    @IsUUID()
    linked_user_id: string;
}