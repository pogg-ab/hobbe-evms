import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class StartStreamDto {
    @ApiProperty({
        description: 'The source of the stream, which can either be a file path or a camera device.',
        example: './media/sample.mp4',
        oneOf: [
            { type: 'string', example: '/path/to/video.mp4' },
            { type: 'object', example: { cameraDevice: '/dev/video0' } },
        ],
    })
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    filePath?: string;

    @ApiProperty({
        description: 'The camera device path for streaming.',
        example: '/dev/video0',
        required: false,
    })
    @IsString()
    @IsOptional()
    cameraDevice?: string;

    @ApiProperty({
        description: 'The source of the stream, either a file path or a camera device',
        example: { "filePath": "./media/sample.mp4" },
        required: true
    })
    @IsObject()
    @IsOptional()
    source?: string | { filePath?: string; cameraDevice?: string };
}
