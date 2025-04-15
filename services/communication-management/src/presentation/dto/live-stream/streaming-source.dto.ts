import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsUrl,
    ValidateIf,
    IsNotEmpty,
    IsIn
} from 'class-validator';

export class StreamingSourceDto {
    @ApiProperty({
        description: 'Path to the input file for streaming',
        example: '/videos/sample.mp4',
        required: false
    })
    @IsString()
    @IsNotEmpty()
    @ValidateIf(o => !o.rtmpOutput && !o.cameraDevice)
    @IsOptional()
    filePath?: string;


    @ApiProperty({
        description: 'Type of the streaming source',
        enum: ['file', 'rtmp', 'camera'],
        default: 'camera'
    })
    @IsIn(['file', 'rtmp', 'camera'])
    @IsOptional()
    type?: 'file' | 'rtmp' | 'camera';
}