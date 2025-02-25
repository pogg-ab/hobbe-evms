
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateMessageDto{
    
    @ApiProperty({ description: "Chat ID", example: "220dd130-76be-4c37-9a11-eb983be51460"})
    @IsNotEmpty()
    chatId: string;

    @ApiProperty({ description: "Content", example: "Hello, My Dear Friend."})
    content: string;
}