import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CreateTicketsDto } from './create-tickets.dto';


export class CreateTicketsHeadingDto {
  @ApiProperty({ description: 'Ticket Name', example: 'Tech Expo 2024' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Event Description',
    example:
      "Join us at the City Tech Expo 2024 to explore the latest innovations in technology. Experience live demonstrations, expert panels, and networking opportunities with industry leaders and tech enthusiasts. From AI advancements to sustainable tech solutions, there's something for everyone!",
  })
  description: string;

  @ApiProperty({
    description: 'Event Schedule',
    example:
      'The event is scheduled for January 25, 2024, starting at 9:00 AM and ending at 5:00 PM. It will take place at the City Convention Center, Hall A.',
  })
  @IsNotEmpty()
  schedule: string;

  @ApiProperty({ description: 'Regular Quantity', example: 50 })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Regular Tickets Price', example: 500 })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Regular Tickets Min Order', example: 1 })
  @IsNotEmpty()
  min_order: number;

  @ApiProperty({ description: 'Regular Tickets Max Order', example: 50 })
  @IsNotEmpty()
  max_order: number;

  // VIP TICKETS

  @ApiProperty({ description: 'VIP Tickets Quantity', example: 10 })
  @IsNotEmpty()
  vip_quantity: number;

  @ApiProperty({ description: 'VIP Tickets Price', example: 2000 })
  @IsNotEmpty()
  vip_price: number;

  @ApiProperty({ description: 'VIP Tickets Min Order', example: 1 })
  @IsNotEmpty()
  vip_min_order: number;

  @ApiProperty({ description: 'VIP Tickets Min Order', example: 1 })
  @IsNotEmpty()
  vip_max_order: number;

// VVIP TICKETS

  @ApiProperty({ description: 'V-VIP Tickets Amount', example: 5 })
  @IsNotEmpty()
  vvip_quantity: number;

  @ApiProperty({ description: 'V-VIP Tickets Price', example: 5000 })
  @IsNotEmpty()
  vvip_price: number;

  @ApiProperty({ description: 'V-VIP Tickets Min Order', example: 1 })
  @IsNotEmpty()
  vvip_min_order: number;

  @ApiProperty({ description: 'V-VIP Tickets Max Order', example: 1 })
  @IsNotEmpty()
  vvip_max_order: number;


  // 

  @ApiProperty({ description: 'Sales Start', example: new Date() })
  @IsNotEmpty()
  sales_start: Date;

  @ApiProperty({ description: 'Sales End', example: new Date() })
  @IsNotEmpty()
  sales_end: Date;

}
