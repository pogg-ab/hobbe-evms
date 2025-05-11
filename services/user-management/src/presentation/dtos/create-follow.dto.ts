import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { FollowStatus } from 'src/domain/value-objects/follow-status.value-object';
import { UserID } from 'src/domain/value-objects/user-id.value-object';

export class CreateFollowDto {
    @ApiProperty({
        description: 'The user ID of the follower (UUID format)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    follower_user_id: string;

    @ApiProperty({
        description: 'The user ID of the following user (UUID format)',
        example: '678e4567-e89b-12d3-a456-426614174001',
    })
    @IsUUID()
    following_user_id: string;

    @ApiProperty({
        description: 'The follow status (optional)',
        enum: FollowStatus,
        default: FollowStatus.PENDING,
        example: FollowStatus.PENDING,
    })
    @IsEnum(FollowStatus)
    @IsOptional()
    status: FollowStatus = FollowStatus.PENDING;

    @ApiProperty({
        description: 'Indicates if the follow is mutual (optional)',
        default: false,
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    is_mutual: boolean = false;
}
