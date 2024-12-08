import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { CreateTicketsListDto } from "./create-tickets-list.dto";
import { Tickets } from "src/domain/entities/tickets.entity";
import { Events } from "src/domain/entities/events.entity";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";


export class CreateTicketsDto{

    @ApiProperty({ description: 'Ticket Name', example: 'Tech Expo 2024' })
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: "Event Description",
        example: "Join us at the City Tech Expo 2024 to explore the latest innovations in technology. Experience live demonstrations, expert panels, and networking opportunities with industry leaders and tech enthusiasts. From AI advancements to sustainable tech solutions, there's something for everyone!",
      })
    description: string;

      @ApiProperty({
        description: 'Event Schedule',
        example: 'The event is scheduled for January 25, 2024, starting at 9:00 AM and ending at 5:00 PM. It will take place at the City Convention Center, Hall A.',
      })
      @IsNotEmpty()
    schedule: string;


      @ApiProperty({description:"Quantity",example:500})
      @IsNotEmpty()
      quantity: number;

      

      @ApiProperty({description:"Price",example:500})
      @IsNotEmpty()
      price: number;

      @ApiProperty({description:"Sales Start",example: new Date()})
      @IsNotEmpty()
      sales_start: Date;

      @ApiProperty({description:"Sales End", example: new Date()})
      @IsNotEmpty()
      sales_end: Date;


      @ApiProperty({description:"Tickets List" , type: CreateTicketsListDto})
      // @IsNotEmpty()
      tickets_list?:CreateTicketsListDto[];

}