import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsObject,
    ValidateNested,
    IsBoolean,
    IsOptional
} from 'class-validator';
import { VideoConfigDto } from './video-config.dto';
import { AudioConfigDto } from './audio-config.dto';
import { StreamingSourceDto } from './streaming-source.dto';

export class StartStreamDto {
    @ApiProperty({ type: StreamingSourceDto })
    @IsObject()
    @ValidateNested()
    @Type(() => StreamingSourceDto)
    source: StreamingSourceDto;

    @ApiProperty({ type: VideoConfigDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => VideoConfigDto)
    video?: VideoConfigDto;

    @ApiProperty({ type: AudioConfigDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => AudioConfigDto)
    audio?: AudioConfigDto;

    @ApiProperty({ default: false })
    @IsBoolean()
    @IsOptional()
    hardwareAcceleration = false;
}