// in src/presentation/dtos/assign-role.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { GroupMembershipRole } from 'src/domain/entities/admin-user-role.entity';

export class AssignRoleDto {
  @ApiProperty({
    description: 'The UUID of the role to assign.',
    example: 'a1b2c3d4-e5f6-4a3b-8c7d-1e2f3a4b5c6d',
  })
  @IsUUID()
  roleId: string;

  @ApiProperty({
    description: 'The membership role (MEMBER or GROUP_ADMIN). Defaults to MEMBER.',
    enum: GroupMembershipRole,
    default: GroupMembershipRole.MEMBER,
    required: false,
  })
  @IsEnum(GroupMembershipRole)
  @IsOptional()
  membershipRole?: GroupMembershipRole;
}