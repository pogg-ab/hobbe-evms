import { ApiProperty } from '@nestjs/swagger';

export class FilterGuestListDto {
  @ApiProperty({
    description: 'Gender of the participant',
    example: 'all',
    enum: ['all', 'male', 'female'],
    required: false,
    default: 'all',
  })
  gender?: 'all' | 'male' | 'female' = 'all';

  @ApiProperty({
    description: 'Date of booking or event',
    example: '2025-08-11',
    required: false,
  })
  date?: string;

  @ApiProperty({
    description: 'Booking type',
    example: 'all',
    enum: ['all', 'Regular', 'VIP', 'VVIP'],
    required: false,
    default: 'all',
  })
  bookingType?: 'all' | 'Regular' | 'VIP' | 'VVIP' = 'all';

  @ApiProperty({
    description: 'Sort order by alphabet',
    example: 'asc',
    enum: ['asc', 'desc'],
    required: false,
    default: 'asc',
  })
  sort?: 'asc' | 'desc' = 'asc';
}
