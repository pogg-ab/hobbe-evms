import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export enum Privileges {
  ADD_SUB_ACCOUNTS = 'add_sub_accounts',
  MANAGE_GUESTS = 'manage_guests',
  MANAGE_SUB_ACCOUNTS = 'manage_sub_accounts',
  CREATE_EVENTS = 'create_events',
}

export class CreateSubAccountDto {
  @ApiProperty({
    description:
      'The account ID (UUID) associated with the sub-account. Can be either personal or organizational.',
    example: 'e7b3e5b9-8fcb-4bfa-aaf0-bc4bda32d29d',
  })
  @IsUUID()
  @IsNotEmpty()
  sub_account_user_id: string;


  @ApiProperty({
    description: 'The privileges assigned to the sub-account',
    enum: Privileges,
    example: 'add_sub_accounts',
  })
  @IsEnum(Privileges)
  @IsNotEmpty()
  privileges: Privileges;

  @ApiProperty({
    description: 'The expiration date of the sub-account',
    example: '2024-12-31T00:00:00.000Z',
  })
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => {
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : null;
  })
  expire_date: Date;
}
