
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { FollowStatus } from 'src/domain/value-objects/follow-status.value-object';

export class UpdateFollowDto {
    @IsEnum(FollowStatus)
    @IsOptional()
    status?: FollowStatus;

    @IsBoolean()
    @IsOptional()
    is_mutual?: boolean;
}
