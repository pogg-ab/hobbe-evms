import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class QrScannedAggregateDto {
  @ApiProperty({
    description: 'Start date for the aggregation',
    example: new Date(),
  })
  @IsNotEmpty()
  @IsString()
  startDate: Date;

  @ApiProperty({
    description: 'End date for the aggregation',
    example: new Date(),
  })
  @IsNotEmpty()
  @IsString()
  endDate: Date;

  @ApiProperty({
    description: ' Type of aggregation to perform',
    example: 'week',
  })
  @IsNotEmpty()
  @IsIn(['day', 'week', 'month', 'year'])
  aggregateType: 'day' | 'week' | 'month' | 'year';
}
