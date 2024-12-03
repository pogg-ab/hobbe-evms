import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class CreateTicketsDto{

    @ApiProperty({ description: 'Ticket Name', example: 'DT-10' })
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Ticket Description',
        example: 'Ticket Event Description',
      })
      description: string;

      @ApiProperty({
        description: 'Event Schedule',
        example: 'Demo Event Schedule',
      })
      @IsNotEmpty()
      schedule: string;


      @ApiProperty({description:"Quantity"})
      @IsNotEmpty()
      quantity: number;

      @ApiProperty({description:"Price"})
      @IsNotEmpty()
      price: number;

      @ApiProperty({description:"Sales Start"})
      @IsNotEmpty()
      sales_start: Date;

      @ApiProperty({description:"Sales End"})
      @IsNotEmpty()
      sales_end: Date;
}