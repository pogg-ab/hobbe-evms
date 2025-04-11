import { IsDateString, IsString, IsOptional } from 'class-validator';

export class ScheduleStreamDto {
    @IsString()
    readonly userId: string;

    @IsString()
    readonly eventId: string;

    @IsDateString()
    readonly scheduledDate: Date;

    @IsString()
    readonly scheduledTime: string;

    @IsString()
    @IsOptional()
    readonly timezone?: string;
}