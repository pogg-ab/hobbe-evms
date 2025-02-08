import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsArray } from 'class-validator';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';

export class ShareEventDto {
  @ApiProperty({ description: 'Event ID', example: 'e33b638b-1356-4e02-bf7a-9b8f47e0e1b6' })
  @IsNotEmpty()
  @IsUUID('4') 
  event_id: IdValueObject;

  @ApiProperty({
    description: 'List of user IDs to share the event with',
    example: ['a12b3456-c78d-90ef-1234-56789abcdef0'],
  })
  @IsArray()
  @IsUUID('4', { each: true }) 
  @IsNotEmpty()
  shared_with_users: string[]; 
}
