import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";

export class CreateEventsDto {
    @ApiProperty({description: 'Event Title',example:'Demo Event'  })
    @IsNotEmpty()
    title: string;

    @ApiProperty({description: 'Event Description',example:'Demo Event Description'  })
    @IsNotEmpty()
    description: string;
    
    @ApiProperty({description: 'Event Privacy',example:'public'  })
    @IsNotEmpty()
    @IsEnum(['public', 'private', 'group'])
    privacy: string;


    @ApiProperty({description: 'Event Catagory',example:'Technology'   })
    @IsNotEmpty()
    catagory: string;

    @ApiProperty({description: 'Event Location',example:'Addis Ababa'  })
    @IsNotEmpty()
    location: string;


    @ApiProperty({example: new Date(), description: 'Event Start Date'  })
    @IsNotEmpty()
    event_start_date: Date;
    
    @ApiProperty({example: new Date(), description: 'Event End Date'  })
    @IsNotEmpty()
    event_end_date: Date;

}
