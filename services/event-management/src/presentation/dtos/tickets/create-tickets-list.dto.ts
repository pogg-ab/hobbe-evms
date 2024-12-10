import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Tickets } from "src/domain/entities/tickets.entity";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";


export class CreateTicketsListDto{

    @ApiProperty({ description: 'Ticket Type', example: 'Regular' })
    @IsNotEmpty()
    type: string;

    @ApiProperty({description:"Price", example:500})
    @IsNotEmpty()
    price: number;

    @ApiProperty({description:"Discount in Percent", example:10})
    discount: number;

  
    qr_code?: string;
    ticket_no?: string;

    @ApiProperty({description:"Ticket Header"})
    @IsNotEmpty()
    ticket_id: IdValueObject;


}