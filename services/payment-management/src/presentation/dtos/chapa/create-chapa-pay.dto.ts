

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsUrl } from "class-validator";



export class CreateChapaPayDto{
    
    @ApiProperty({ description: "Amount", example: "100"})
    @IsNotEmpty()
    amount: number;

    @ApiProperty({ description: "Currency", example: "ETB"})
    @IsNotEmpty()
    currency: string;

    @ApiProperty({ description: "Email", example: "abebech_bekele@gmail.com"})
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: "First Name", example: "John"})
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ description: "Last Name", example: "Doe"})
    @IsNotEmpty()
    last_name: string;

    @ApiProperty({ description: "Phone", example: "0900123456"})
    @IsNotEmpty()
    phone_number: string;

    @ApiProperty({ description: "Text Reference ", example: "chewatatest-2569"})
    @IsNotEmpty()
    tx_ref: string;


    @ApiProperty({ description: "Callback URL", example: "https://webhook.site/077164d6-29cb-40df-ba29-8a00e59a7e60"})
    @IsUrl()
    callback_url: string;

    @ApiProperty({ description: "Return URL", example: "https://www.google.com/"})
    @IsOptional()
    @IsUrl()
    return_url?: string;
}