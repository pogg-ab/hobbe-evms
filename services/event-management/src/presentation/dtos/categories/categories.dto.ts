import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class CreateCategoriesDto{
    
    @ApiProperty({ description: "Event categories", example: "Sport"})
    @IsNotEmpty()
    name: string;

    // @ApiProperty({ description: "Description of event categories", example: "This category includes sports events"})
    // @IsNotEmpty()
    // description: string;
}