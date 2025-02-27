

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class AddChatMemberDto{
    
    @ApiProperty({ description: "Chat ID", example: "220dd130-76be-4c37-9a11-eb983be51460"})
    @IsNotEmpty()
    chatId: string;

    @ApiProperty({ description: "User ID", example: "450dd130-76be-4c37-9a11-eb983be53445"})
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ description: "Username", example: "Mohamed Ali"})
    @IsNotEmpty()
    userName: string;
}