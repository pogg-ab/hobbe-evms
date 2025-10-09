import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Max } from 'class-validator';

export class UpdatePromocodeDto {
  @ApiProperty({ description: 'Promocode', example: '#UPDT123' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Promocode Quantity', example: 50 })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Discount in %', example: 10 })
  @IsNotEmpty()
  @Max(100)
  discount: number;

  @ApiProperty({ description: 'Promocode start from', example: new Date() })
  // @IsNotEmpty()
  promo_start_date: Date;

  @ApiProperty({ description: 'Sales End', example: new Date() })
  // @IsNotEmpty()
  promo_end_date: Date;

  @ApiProperty({
    description: 'Promocode Description',
    example:
      "Join us at the City Tech Expo 2024 to explore the latest innovations in technology. Experience live demonstrations, expert panels, and networking opportunities with industry leaders and tech enthusiasts. From AI advancements to sustainable tech solutions, there's something for everyone!",
  })
  description?: string;
}
