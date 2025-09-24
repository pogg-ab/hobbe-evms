import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class ChapaGetRefundByDateRangeDto {
  @ApiProperty({
    description: 'Start date for the refund search in YYYY-MM-DD format',
    example: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
  })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    description: 'End date for the refund search in YYYY-MM-DD format',
    example: new Date().toISOString().split('T')[0],
  })
  @IsString()
  @IsNotEmpty()
  to: string;
}