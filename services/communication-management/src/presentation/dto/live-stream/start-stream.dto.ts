import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StartStreamDto {
    @ApiProperty({
        description: 'Path to the file to stream',
        example: './media/sample.mp4',
    })
    @IsNotEmpty()
    @IsString()
    filePath: string;
}