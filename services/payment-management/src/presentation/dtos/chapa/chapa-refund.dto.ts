import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";


export class ChapaRefundDto {
  @ApiProperty({
    description: 'The transaction reference returned by Chapa after payment',
    example: 'TX-20250917-12345',
  })
  @IsString()
  @IsNotEmpty()
  txRef: string;

  //  @ApiPropertyOptional({
  //   description: 'Amount to refund. If not provided, a full refund will be processed',
  //   example: 100,
  // })
  // @IsOptional()
  // @IsNumber()
  // @Min(1)
  // amount?: number;


   @ApiPropertyOptional({
    description: 'Reason for the refund',
    example: 'Customer requested a refund due to duplicate payment',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}