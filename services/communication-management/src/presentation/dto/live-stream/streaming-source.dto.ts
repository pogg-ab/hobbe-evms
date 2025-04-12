import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class StreamingSourceDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    filePath?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    rtmpOutput?: string;
}