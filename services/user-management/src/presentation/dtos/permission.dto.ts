import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class PermissionDto {
  @AutoMap()
  @ApiProperty({
    description: 'The unique identifier for the permission.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  permission_id: string;

  @AutoMap()
  @ApiProperty({
    description: 'The action the permission grants (e.g., view, create, update).',
    example: 'view',
  })
  action: string;

  @AutoMap()
  @ApiProperty({
    description: 'The resource the action applies to (e.g., Report, Event).',
    example: 'Report',
  })
  resource: string;
}