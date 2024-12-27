import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Events } from "src/domain/entities/events.entity";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";


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

    // event_id?: string;
}