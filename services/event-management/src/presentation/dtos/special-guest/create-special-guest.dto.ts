import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';

export class CreateSpecialGuestDto {
  @ApiProperty({
    description: 'ID of the event the guest is invited to',
    example: 'e5f20d37-2f77-45e2-b470-cff5f3bcad5d',
  })
  @IsNotEmpty()
  @IsUUID()
  event_id: IdValueObject;

  @ApiProperty({
    description: 'ID of the guest user',
    example: 'bb616810-b518-4028-8f9b-b1f2a4e5861b',
  })
  @IsNotEmpty()
  @IsUUID()
  guest_user_id: string;
}
