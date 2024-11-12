import { PartialType } from '@nestjs/mapped-types';
import { CreateEventsDto } from './create-events.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventsDto extends PartialType(CreateEventsDto) {

    @ApiProperty({description: 'Event Title',example:'Demo Event'  })
    @IsNotEmpty()
    title: string;

    @ApiProperty({description: 'Event Description',example:'Demo Event Description'  })
    @IsNotEmpty()
    description: string;
    
    @ApiProperty({description: 'Event Privacy',example:'public'  })
    @IsEnum(['public', 'private', 'group'])
    privacy: string;


    @ApiProperty({description: 'Event Catagory',example:'Technology'   })
    catagory: string;

    @ApiProperty({description: 'Event Location',example:'Addis Ababa'  })
    location: string;


    @ApiProperty({example: new Date(), description: 'Event Start Date'  })
    event_start_date: Date;
    
    @ApiProperty({example: new Date(), description: 'Event End Date'  })
    event_end_date: Date;
   
}
