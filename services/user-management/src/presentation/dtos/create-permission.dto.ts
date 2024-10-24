import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'The action of the permission',
    example: 'create:user',
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    description: 'The resource to which the action applies',
    example: 'User',
  })
  @IsString()
  @IsNotEmpty()
  resource: string;
}
