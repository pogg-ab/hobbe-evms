import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { Privileges } from './create-sub-account.dto';
import { SubAccountStatus } from 'src/domain/value-objects/sub-account-status.value-object';

export class UpdateSubAccountDto {
  @ApiProperty({
    description: 'The privileges assigned to the sub-account (optional)',
    type: [String],
    enum: Privileges,
    example: ['create_events', 'manage_guests'],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Privileges, { each: true })
  privileges?: Privileges[];

  @ApiProperty({
    description: 'The expiration date of the sub-account (optional)',
    example: '2024-12-31T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : undefined;
  })
  expire_date?: Date;

  @ApiProperty({
    description: 'The status of the sub-account (optional)',
    enum: ['active', 'inactive', 'suspended', 'pending'],
    example: 'active',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: SubAccountStatus;
}
