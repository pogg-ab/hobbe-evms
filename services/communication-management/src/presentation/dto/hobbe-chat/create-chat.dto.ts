

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class CreatePrivateChatDto{
    
    @ApiProperty({ description: "Friend ID", example: "2a746456-8fad-40ec-8559-b2e096d99946"})
    @IsNotEmpty()
    friendId: string;

    @ApiProperty({ description: "Friend Name", example: "Mohamed Ali"})
    @IsNotEmpty()
    name: string;
}