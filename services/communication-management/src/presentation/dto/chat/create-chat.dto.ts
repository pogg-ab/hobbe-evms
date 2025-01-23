import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateChatDto{
    @ApiProperty({ description: 'To', example: '9ea675ab-19bc-440d-808e-842efbbc467a' })
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Message', example: 'Hello World' })
    @IsNotEmpty()
    message: string;
}