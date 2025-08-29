import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsString } from 'class-validator';

export class TicketTypeOverview {
  @ApiProperty({
    description: 'Ticket type (Regular, VIP, VVIP)',
    example: 'Regular',
    enum: ['Regular', 'VIP', 'VVIP'],
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Total number of tickets for this type',
    example: 100,
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    description: 'Number of sold tickets for this type',
    example: 80,
  })
  @IsNumber()
  sold: number;

  @ApiProperty({
    description: 'Number of available tickets for this type',
    example: 20,
  })
  @IsNumber()
  available: number;
}

export class TicketSalesOverviewResponseDto {
  @ApiProperty({
    description: 'Event ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  eventId: string;

  @ApiProperty({
    description: 'Total number of tickets for the event',
    example: 300,
  })
  @IsNumber()
  totalTickets: number;

  @ApiProperty({
    description: 'Total number of sold tickets (Paid, Booked, Completed)',
    example: 200,
  })
  @IsNumber()
  soldTickets: number;

  @ApiProperty({
    description: 'Total number of available tickets',
    example: 100,
  })
  @IsNumber()
  availableTickets: number;

  @ApiProperty({
    description: 'Breakdown of ticket sales by type',
    type: [TicketTypeOverview],
  })
  @IsObject()
  byType: TicketTypeOverview[];
}
