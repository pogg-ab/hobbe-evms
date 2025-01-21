import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";



export class CommentsDto{
    
   
    @ApiProperty({ description: "Event ID", example: "e33b638b-1356-4e02-bf7a-9b8f47e0e1b6"})
    @IsNotEmpty()
    event_id: IdValueObject;

    @ApiProperty({ description: "Comment", example: " Drop Your Events Comment Here"})
    @IsNotEmpty()
    comment: string;
}