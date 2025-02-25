

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class CreateChatDto{
    
    @ApiProperty({ description: "Friend ID", example: "220dd130-76be-4c37-9a11-eb983be51460"})
    @IsNotEmpty()
    friendId: string;

    @ApiProperty({ description: "Chat Type", example: "private"})
    @IsNotEmpty()
    type: string;

    @ApiProperty({ description: "Give a Name If It's Group", example: "Group One"})
    name?: string;
}