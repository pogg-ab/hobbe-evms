import { ApiProperty } from '@nestjs/swagger';

export class GetRoleDto {
  @ApiProperty({
    description: 'The unique identifier of the role',
    example: '11dfdb6b-ada4-4d70-9497-dada54ba92ca',
  })
  role_id: string;

  @ApiProperty({ description: 'The name of the role', example: 'Admin' })
  name: string;

  @ApiProperty({
    description: 'A brief description of the role',
    example: 'Administrator with full access',
  })
  description: string;
}
