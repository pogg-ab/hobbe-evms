import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Max } from "class-validator";


export class CreateBankAccountDto{
    @ApiProperty({description: 'Country',example:'Ethiopia'  })
    @IsNotEmpty()
    country: string;

    @ApiProperty({description: 'Currency',example:'ETB'  })
    @IsNotEmpty()
    currency: string;

    @ApiProperty({description: 'Bank Name',example:'CBE'  })
    @IsNotEmpty()
    bank_name: string;


    @ApiProperty({description: 'Account Owner',example:'Challa Dibba'  })
    @IsNotEmpty()
    account_owner: string;


    @ApiProperty({description: 'Account Number',example:'10002458488'  })
    @IsNotEmpty()
    account_number: string;


    @ApiProperty({description: 'Profit Share Amount',example:'35'  })
    @IsNotEmpty()
    @Max(100)
    profit_share_amount: number;

   
}