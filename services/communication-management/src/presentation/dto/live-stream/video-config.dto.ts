import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsBoolean,
    IsIn,
    IsInt,
    Min,
    Max
} from 'class-validator';

export class VideoConfigDto {
    @ApiProperty({ example: '/dev/video0' })
    @IsString()
    device: string = 'default';

    @ApiProperty({ default: true })
    @IsBoolean()
    enabled = true;

    @ApiProperty({ enum: ['640x480', '1280x720', '1920x1080'] })
    @IsIn(['640x480', '1280x720', '1920x1080'])
    resolution: string = '1280x720';

    @ApiProperty({ minimum: 1, maximum: 120 })
    @IsInt()
    @Min(1)
    @Max(120)
    framerate = 30;
}