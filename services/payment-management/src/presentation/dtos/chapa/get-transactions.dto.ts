import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class GetTransactionDto {

@ApiProperty({description:"from date",example:new Date().toISOString()})
from?: string;
@ApiProperty({description:"to date",example:new Date().toISOString()})
to?: string;
@ApiProperty({description:"page",example:1})
page?: number;
@ApiProperty({description:"per_page",example:20})
per_page?: number;

}
