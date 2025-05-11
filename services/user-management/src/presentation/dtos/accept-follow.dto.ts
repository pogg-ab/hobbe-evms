
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { FollowStatus } from 'src/domain/value-objects/follow-status.value-object';

export class AcceptFollowDto {
    @IsEnum(FollowStatus)
    @IsOptional()
    status: FollowStatus = FollowStatus.ACCEPTED;

    @IsBoolean()
    @IsOptional()
    is_mutual: boolean = false;
}
