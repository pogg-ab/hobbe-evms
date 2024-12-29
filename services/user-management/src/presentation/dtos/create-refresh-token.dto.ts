import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RefreshTokenDto {
  @ApiProperty({
    description: "The refresh token used for obtaining a new access token",
    example: "your-refresh-token-here",
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
