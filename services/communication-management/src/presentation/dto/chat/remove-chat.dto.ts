import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RemoveChatDto{
    @ApiProperty({ description: 'Chat ID', example: '9ea675ab-19bc-440d-808e-842efbbc467a' })
    @IsNotEmpty()
    chat_id: string;

    @ApiProperty({ description: 'Friends ID', example: '9ea675ab-19bc-440d-808e-842efbbc467a' })
    @IsNotEmpty()
    friend: string;

    @ApiProperty({ description: 'Remove From Both  ?', example: 'false' })
    @IsNotEmpty()
    removeFromBothSide: boolean;
}

