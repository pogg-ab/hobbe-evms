import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";


export class ChapaCancelEventRefundDto {
  @ApiProperty({
    description: 'Cancel Event ID uuid',
    example:'849b4dda-fc2b-452d-bc12-e8dd0bc8b6f7'
  })
  @IsString()
  @IsNotEmpty()
  event_id: string;


   @ApiPropertyOptional({
    description: 'Reason for the refund',
    example: 'Customer requested a refund due to duplicate payment',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}