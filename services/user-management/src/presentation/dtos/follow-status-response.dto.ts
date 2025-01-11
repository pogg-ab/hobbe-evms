import { ApiProperty } from '@nestjs/swagger';
import { FollowStatus } from 'src/domain/value-objects/follow-status.value-object';

export class FollowStatusResponseDto {
    @ApiProperty({
        description: 'Current follow status between two users',
        enum: FollowStatus,
    })
    status: FollowStatus;
}
