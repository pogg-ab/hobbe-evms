import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateFavoriteDto {
    @ApiProperty({
        description: 'The user ID of the user who is marking another user as a favorite (UUID format)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    favoriting_user_id: string;

    @ApiProperty({
        description: 'The user ID of the user being marked as a favorite (UUID format)',
        example: '678e4567-e89b-12d3-a456-426614174001',
    })
    @IsUUID()
    favorited_user_id: string;
}
