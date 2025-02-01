import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateChatDto{
    @ApiProperty({ description: 'To', example: '9ea675ab-19bc-440d-808e-842efbbc467a' })
    @IsNotEmpty()
    chat_id: string;

    @ApiProperty({ description: 'To', example: '9ea675ab-19bc-440d-808e-842efbbc467a' })
    @IsNotEmpty()
    friend: string;

    @ApiProperty({ description: 'Message', example: 'Hello World' })
    text: string;

    @ApiProperty({ description: 'Message'})
    file: string;


    @ApiProperty({ description: 'Message' })
    audio: string;
}