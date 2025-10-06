import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsArray } from 'class-validator';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';

export class ShareEventDto {
  @ApiProperty({
    description: 'Event ID',
    example: '432d910d-48de-4384-935c-2a3bf70fe68c',
  })
  @IsNotEmpty()
  @IsUUID('4')
  event_id: IdValueObject;

  @ApiProperty({
    description: 'List of user IDs to share the event with',
    example: ['432d910d-48de-4384-935c-2a3bf70fe68c'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  shared_with_users: string[];
}
