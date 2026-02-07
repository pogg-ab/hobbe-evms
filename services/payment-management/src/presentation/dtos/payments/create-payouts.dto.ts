

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";



export class CreatePayoutDto{
    
    // create dto for payout entity
    @ApiProperty({ description: "User ID", example: "849b4dda-fc2b-452d-bc12-e8dd0bc8b6f3"})
    @IsNotEmpty()
    user_id: string;
 
}