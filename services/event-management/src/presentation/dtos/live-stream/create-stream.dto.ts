import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateStreamDto {
  @ApiProperty({
    description: 'User ID associated with the stream (UUID format)',
    example: '9ea675ab-19bc-440d-808e-842efbbc467a',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Event ID for the stream (UUID format)',
    example: '6d0139f4-dc76-4fcd-a58f-2f5209f970ec',
  })
  @IsNotEmpty()
  @IsUUID()
  eventId: string;
}
