import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
} from 'class-validator';
export enum Privileges {
  ADD_SUB_ACCOUNTS = 'add_sub_accounts',
  MANAGE_GUESTS = 'manage_guests',
  MANAGE_SUB_ACCOUNTS = 'manage_sub_accounts',
  CREATE_EVENTS = 'create_events',
}

export class CreateSubAccountDto {
  @ApiProperty({
    description: 'The email address associated with the sub-account',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The phone number associated with the sub-account',
    example: '+1234567890',
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    description: 'The privileges assigned to the sub-account',
    enum: Privileges,
    example: 'ADD_SUB_ACCOUNTS',
  })
  @IsEnum(Privileges)
  @IsNotEmpty()
  privileges: Privileges;

  @ApiProperty({
    description: 'The expiration date of the sub-account',
    example: '2024-12-31',
  })
  @IsDate()
  @IsNotEmpty()
  expire_date: Date;
}
