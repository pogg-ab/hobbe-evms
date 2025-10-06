import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetEventsByDateRnage {
  @ApiProperty({ description: 'Start Date', example: '2025-01-01' })
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ description: 'End Date', example: '2025-01-30' })
  @IsNotEmpty()
  endDate: Date;
}
