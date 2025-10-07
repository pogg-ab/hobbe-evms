import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class QrCodeActionAfterScannedDto {
  @ApiProperty({
    description: 'ID of the QR code scan log',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Action taken after the QR code was scanned',
    example: 'visited_event_page',
  })
  @IsNotEmpty()
  @IsString()
  action_taken_after_scan: string;
}
