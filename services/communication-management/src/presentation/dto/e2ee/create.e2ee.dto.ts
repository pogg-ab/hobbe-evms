
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class E2EEDto{
    @ApiProperty({ description: 'User ID'})
    @IsNotEmpty()
    user_id: string;

    @ApiProperty({ description: 'Public Key'})
    privateKey: string;

    @ApiProperty({ description: 'Private Key'})
    publicKey: string;
}