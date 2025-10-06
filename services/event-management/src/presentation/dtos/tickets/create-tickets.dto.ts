import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { TicketsHeading } from 'src/domain/entities/tickets-heading.entity';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';

export class CreateTicketsDto {
  @ApiProperty({ description: 'Ticket Type', example: 'Regular' })
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Price', example: 500 })
  @IsNotEmpty()
  price: number;

  qr_code?: string;
  ticket_no?: string;

  @ApiProperty({ description: 'Event' })
  @IsNotEmpty()
  event_id: IdValueObject;

  @ApiProperty({ description: 'Ticket Header' })
  @IsNotEmpty()
  ticket_heading_id: IdValueObject;
}
