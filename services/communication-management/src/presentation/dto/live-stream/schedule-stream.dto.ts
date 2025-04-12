import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsString, IsOptional, IsNotEmpty, IsUUID } from "class-validator";

export class ScheduleStreamDto {

    @ApiProperty({
        description: 'Event ID for the stream',
        example: '6d0139f4-dc76-4fcd-a58f-2f5209f970ec',
    })
    @IsNotEmpty()
    @IsUUID()
    readonly eventId: string;

    @ApiProperty({
        description: 'Scheduled date of the stream (ISO 8601 date string)',
        example: '2023-10-15',
    })
    @IsNotEmpty()
    @IsDateString()
    readonly scheduledDate: Date;

    @ApiProperty({
        description: 'Scheduled time of the stream',
        example: '14:00',
    })
    @IsNotEmpty()
    @IsString()
    readonly scheduledTime: string;

    @ApiProperty({
        description: 'Timezone for the scheduled stream',
        example: 'Africa/Addis_Ababa',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly timezone?: string;
}