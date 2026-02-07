import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsArray } from 'class-validator';
import { SponsorshipType } from 'src/domain/entities/event-sponsor.entity';

export class CreateEventSponsorDto {
  @ApiProperty({
    description: 'ID of the event the sponsor is associated with',
    example: 'e5f20d37-2f77-45e2-b470-cff5f3bcad5d',
  })
  @IsNotEmpty()
  @IsUUID()
  event_id: string;

  @ApiProperty({
    description: 'Array of sponsor user IDs',
    example: [
      'bb616810-b518-4028-8f9b-b1f2a4e5861b',
      'c2d7f125-29d7-47e7-bfdb-2bc7cc5c9653',
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  sponsor_user_id: string[];

  @ApiProperty({
    description: 'Type of sponsorship (e.g., gold, silver, bronze)',
    example: 'gold',
  })
  @IsNotEmpty()
  @IsString()
  sponsorship_type: SponsorshipType;
}
