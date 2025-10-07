import { ApiProperty } from '@nestjs/swagger';
import { FilterEventsDto } from 'src/presentation/dtos/events/filter-events.dto';
import { Events } from 'src/domain/entities/events.entity';

export class FindAllEventsResponseDto {
  @ApiProperty({
    description: 'Array of events',
    type: [Events],
    nullable: true,
  })
  events: Events[] | null;

  @ApiProperty({
    description: 'Total number of events',
    example: 100,
    type: Number,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
    type: Number,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    type: Number,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
    type: Number,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Applied filters',
    type: FilterEventsDto,
  })
  filters: FilterEventsDto;
}
