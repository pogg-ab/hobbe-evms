import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsIn } from 'class-validator';

export class AudioConfigDto {
    @ApiProperty({ default: true })
    @IsBoolean()
    enabled = true;

    @ApiProperty({ enum: [22050, 44100, 48000] })
    @IsIn([22050, 44100, 48000])
    sampleRate = 44100;

    @ApiProperty({ enum: [1, 2] })
    @IsIn([1, 2])
    channels = 2;
}