import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsBoolean,
    IsIn,
    IsInt,
    Min,
    Max,
    IsOptional,
    ValidateIf
} from 'class-validator';

export class VideoConfigDto {
    @ApiProperty({
        description: 'Enable/disable video stream',
        default: true
    })
    @IsBoolean()
    enabled = true;

    @ApiProperty({
        description: 'Output resolution of the stream',
        enum: ['640x480', '854x480', '1280x720', '1920x1080', '2560x1440', '3840x2160'],
        default: '1280x720'
    })
    @IsIn(['640x480', '854x480', '1280x720', '1920x1080', '2560x1440', '3840x2160'])
    resolution: string = '1280x720';

    @ApiProperty({
        description: 'Target frame rate (FPS)',
        minimum: 1,
        maximum: 120,
        default: 30
    })
    @IsInt()
    @Min(1)
    @Max(120)
    framerate = 30;

    @ApiProperty({
        description: 'Video bitrate in kbps',
        minimum: 500,
        maximum: 20000,
        default: 2000,
        required: false
    })
    @IsInt()
    @Min(500)
    @Max(20000)
    @ValidateIf(o => o.enabled)
    bitrate = 2000;

    @ApiProperty({
        description: 'Maximum bitrate (for VBR) in kbps',
        minimum: 500,
        maximum: 20000,
        default: 2500,
        required: false
    })
    @IsInt()
    @Min(500)
    @Max(20000)
    @ValidateIf(o => o.enabled)
    maxBitrate = 2500;

    @ApiProperty({
        description: 'Encoder buffer size in kbps',
        minimum: 500,
        maximum: 40000,
        default: 4000,
        required: false
    })
    @IsInt()
    @Min(500)
    @Max(40000)
    @ValidateIf(o => o.enabled)
    bufferSize = 4000;

    @ApiProperty({
        description: 'Group of Pictures (GOP) length',
        minimum: 1,
        maximum: 300,
        default: 60,
        required: false
    })
    @IsInt()
    @Min(1)
    @Max(300)
    @ValidateIf(o => o.enabled)
    gop = 60;

    @ApiProperty({
        description: 'Minimum keyframe interval',
        minimum: 1,
        maximum: 300,
        default: 60,
        required: false
    })
    @IsInt()
    @Min(1)
    @Max(300)
    @ValidateIf(o => o.enabled)
    keyintMin = 60;

    @ApiProperty({
        description: 'Pixel format',
        enum: ['yuv420p', 'yuv422p', 'yuv444p', 'nv12'],
        default: 'yuv420p',
        required: false
    })
    @IsIn(['yuv420p', 'yuv422p', 'yuv444p', 'nv12'])
    @ValidateIf(o => o.enabled)
    pixelFormat = 'yuv420p';

    @ApiProperty({
        description: 'Hardware acceleration API to use',
        enum: ['none', 'vaapi', 'nvenc', 'qsv', 'videotoolbox'],
        default: 'none',
        required: false
    })
    @IsIn(['none', 'vaapi', 'nvenc', 'qsv', 'videotoolbox'])
    @ValidateIf(o => o.enabled)
    hwAccel: 'none' | 'vaapi' | 'nvenc' | 'qsv' | 'videotoolbox' = 'none';
}