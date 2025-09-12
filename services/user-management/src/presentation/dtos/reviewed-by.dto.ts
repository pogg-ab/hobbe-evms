// src/application/dtos/reviewed-by.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ReviewedByDto {
  @ApiProperty()
  adminId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;
}
