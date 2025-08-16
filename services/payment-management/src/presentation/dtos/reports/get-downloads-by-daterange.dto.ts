import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GetDownloadsByDateRangeDto {
    @ApiProperty({
        description: 'Start date for the date range',
        example: new Date().toISOString(),
    })
    @IsNotEmpty()
    @IsString()
    startDate: string;
    
    @ApiProperty({
        description: 'End date for the date range',
        example: new Date().toISOString(),
    })
    @IsNotEmpty()
    @IsString()
    endDate: string;
}