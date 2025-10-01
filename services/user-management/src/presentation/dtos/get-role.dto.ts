import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes'; // <-- Import AutoMap
import { PermissionDto } from './permission.dto'; // <-- Import the new PermissionDto

export class GetRoleDto {
  @AutoMap()
  @ApiProperty({
    description: 'The unique identifier of the role',
    example: '11dfdb6b-ada4-4d70-9497-dada54ba92ca',
  })
  role_id: string;

  @AutoMap()
  @ApiProperty({ description: 'The name of the role', example: 'Admin' })
  name: string;

  @AutoMap()
  @ApiProperty({
    description: 'A brief description of the role',
    example: 'Administrator with full access',
  })
  description: string;

  @AutoMap(() => [PermissionDto])
  @ApiProperty({
    description: 'The list of permissions assigned to this role.',
    type: [PermissionDto],
  })
  permissions: PermissionDto[];
}
