import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from "class-validator";

export class AuthDto {
  @ApiProperty({
    description: "The username of the user",
    example: "john_doe",
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: "The password of the user",
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: "Whether the user wants to be remembered for future logins",
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
