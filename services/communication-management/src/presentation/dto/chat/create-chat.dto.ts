import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateChatDto{
    @ApiProperty({ description: 'To', example: '9ea675ab-19bc-440d-808e-842efbbc467a' })
    @IsNotEmpty()
    to: string;

    @ApiProperty({ description: 'Message', example: 'Hello World' })
    text: string;

    @ApiProperty({ description: 'Message', example: 'https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1xIbuX.img?w=800&h=435&q=60&m=2&f=jpg' })
    file: string;


    @ApiProperty({ description: 'Message', example: '' })
    audio: string;
}