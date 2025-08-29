import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class AdminUpdateEventsDto {
  // user_id: string;

  @ApiProperty({ description: 'Event Title', example: 'Demo Event' })
  @IsOptional()
  title: string;

  @ApiProperty({
    description: 'Event Thumbnail',
    example:
      'https://3.files.edl.io/7e26/22/02/01/162416-f4c177eb-1c0c-4604-ad72-2fc53c318332.jpg',
  })
  @IsOptional()
  thumbnail: string;

  @ApiProperty({
    description: 'Event Cover Image',
    example:
      'https://3.files.edl.io/7e26/22/02/01/162416-f4c177eb-1c0c-4604-ad72-2fc53c318332.jpg',
  })
  @IsOptional()
  cover_image: string;

  @ApiProperty({ description: 'Event Type', example: 'In Person' })
  @IsOptional()
  event_type: string;

  @ApiProperty({ description: 'Event Has Promocode ?', example: false })
  @IsOptional()
  hasPromocode: boolean;

  @ApiProperty({ description: 'Event is Paid ?', example: true })
  @IsOptional()
  isPaid: boolean;

  @ApiProperty({
    description: 'Event Description',
    example: 'Demo Event Description',
  })
  @IsOptional()
  description: string;

  @ApiProperty({ description: 'Event Privacy', example: 'public' })
  @IsOptional()
  @IsEnum(['public', 'private', 'group'])
  privacy: string;

  @ApiProperty({ description: 'Event Location', example: 'Addis Ababa' })
  @IsOptional()
  location: string;

  @ApiProperty({ description: 'Event Location', example: '9.254140' })
  @IsOptional()
  latitude: string;

  @ApiProperty({ description: 'Event Location', example: '38.990629' })
  @IsOptional()
  longitude: string;

  @ApiProperty({ example: new Date(), description: 'Event Start Date' })
  @IsOptional()
  event_start_date: Date;

  @ApiProperty({ example: new Date(), description: 'Event End Date' })
  @IsOptional()
  event_end_date: Date;

  @ApiProperty({
    description: 'Event Category',
    isArray: true,
    example: ['Sports', 'Health'],
  })
  @IsOptional()
  categories: string[];
}
