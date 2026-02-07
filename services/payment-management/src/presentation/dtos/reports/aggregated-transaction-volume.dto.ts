// dto for  to get total transaction value aggregated by day, week, month, year
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
export class AggregatedTransactionVolumeDto {
  @ApiProperty({ type: String, description: 'Start date for the aggregation', example: new Date().toISOString() })
  @IsDateString()
  startDate: string;

  @ApiProperty({ type: String, description: 'End date for the aggregation', example: new Date().toISOString() })
  @IsDateString()
  endDate: string;


  @ApiProperty({
    type: String,
    description: 'Aggregation type (day, week, month, year)',
    example: 'month',
  })
  @IsDateString()
  aggregationType: 'day' | 'week' | 'month' | 'year';
}

