// src/application/dtos/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Address } from 'src/domain/value-objects/address.value-object';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  address: Address;
}
