

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsUrl } from "class-validator";



export class CreatePaymentDto{
    
    @ApiProperty({ description: "User ID", example: "849b4dda-fc2b-452d-bc12-e8dd0bc8b6f3"})
    @IsNotEmpty()
    user_id: string;

    @ApiProperty({ description: "Event ID", example: "849b4dda-fc2b-452d-bc12-e8dd0bc8b6f3"})
    @IsNotEmpty()
    event_id: string;

    @ApiProperty({ description: "Booking ID", example: "849b4dda-fc2b-452d-bc12-e8dd0bc8b6f3"})
    @IsNotEmpty()
    booking_id: string;

}