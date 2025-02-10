import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString } from 'class-validator';
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
    description: 'ID of the sponsor user',
    example: 'bb616810-b518-4028-8f9b-b1f2a4e5861b',
  })
  @IsNotEmpty()
  @IsUUID()
  sponsor_user_id: string;

  @ApiProperty({
    description: 'Type of sponsorship (e.g., gold, silver, bronze)',
    example: 'gold',
  })
  @IsNotEmpty()
  @IsString()
  sponsorship_type: SponsorshipType;
}
