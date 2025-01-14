import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class CreateBankAccountDto{
    @ApiProperty({description: 'Bank Name',example:'CBE'  })
    @IsNotEmpty()
    bank_name: string;


    @ApiProperty({description: 'Account Owner',example:'Challa Dibba'  })
    @IsNotEmpty()
    account_owner: string;


    @ApiProperty({description: 'Account Number',example:'10002458488'  })
    @IsNotEmpty()
    account_number: string;

    @ApiProperty({description: 'Country',example:'Ethiopia'  })
    @IsNotEmpty()
    country: string;

    @ApiProperty({description: 'Currency',example:'ETB'  })
    @IsNotEmpty()
    currency: string;
}