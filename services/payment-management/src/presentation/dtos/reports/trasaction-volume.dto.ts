import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class TransactionsVolumeByDateRangeDto {
  @ApiProperty({ description: "Start Date", example: new Date().toISOString() })
  @IsString()
  startDate: string;

  @ApiProperty({ description: "End Date", example: new Date().toISOString() })
  @IsString()
  endDate: string;

  // @ApiProperty({ description: "Currency", example: "USD" })
  // @IsIn(['USD', 'EUR', 'ETB', 'GBP'])
  // currency: 'USD' | 'EUR' | 'ETB' | 'GBP';
 
}
