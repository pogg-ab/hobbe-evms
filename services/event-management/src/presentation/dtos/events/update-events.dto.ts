import { PartialType } from '@nestjs/mapped-types';
import { CreateEventsDto } from './create-events.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventsDto extends PartialType(CreateEventsDto) {

    @ApiProperty({ description: 'Event Title', example: 'Updated Event' })
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Event Thumbnail', example: 'https://3.files.edl.io/7e26/22/02/01/162416-f4c177eb-1c0c-4604-ad72-2fc53c318332.jpg' })
    @IsNotEmpty()
    thumbnail: string;
  
    @ApiProperty({ description: 'Event Cover Image', example: 'https://3.files.edl.io/7e26/22/02/01/162416-f4c177eb-1c0c-4604-ad72-2fc53c318332.jpg' })
    @IsNotEmpty()
    cover_image: string;
  
    @ApiProperty({ description: 'Event Type', example: 'In Person' })
    @IsNotEmpty()
    event_type: string;
  
    @ApiProperty({ description: 'Event Has Promocode ?', example: false })
    @IsNotEmpty()
    hasPromocode: boolean;
  
    @ApiProperty({ description: 'Event is Paid ?', example: true })
    @IsNotEmpty()
    isPaid: boolean;
  
    @ApiProperty({
      description: 'Event Description',
      example: 'Demo Event Description',
    })
    @IsNotEmpty()
    description: string;
  
    @ApiProperty({ description: 'Event Privacy', example: 'public' })
    @IsNotEmpty()
    @IsEnum(['public', 'private', 'group'])
    privacy: string;
  
  
    @ApiProperty({ description: 'Event Category', example: 'Technology' })
    @IsNotEmpty()
    category: string;
  
    @ApiProperty({ description: 'Event Location', example: 'Addis Ababa' })
    @IsNotEmpty()
    location: string;
  
    @ApiProperty({ description: 'Event Location', example: '9.254140' })
    @IsNotEmpty()
    latitude: string;
  
    @ApiProperty({ description: 'Event Location', example: '38.990629' })
    @IsNotEmpty()
    longitude: string;
  
    @ApiProperty({ example: new Date(), description: 'Event Start Date' })
    @IsNotEmpty()
    event_start_date: Date;
  
    @ApiProperty({ example: new Date(), description: 'Event End Date' })
    @IsNotEmpty()
    event_end_date: Date;
  
}
