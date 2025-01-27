import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
} from 'class-validator';
import { User } from 'src/domain/entities/user.entity';

export class CreateSmsDto {
  @IsNotEmpty()
  @IsPhoneNumber(null)
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsObject()
  user: User;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number | null;
}
