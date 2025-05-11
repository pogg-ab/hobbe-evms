

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class CreateChatUserDto{
    
    @ApiProperty({ description: "Friend ID", example: "2a746456-8fad-40ec-8559-b2e096d99946"})
    @IsNotEmpty()
    userId: string;

//     @ApiProperty({ description: "Friend Name", example: "Mohamed Ali"})
//     @IsNotEmpty()
//     name: string;
}