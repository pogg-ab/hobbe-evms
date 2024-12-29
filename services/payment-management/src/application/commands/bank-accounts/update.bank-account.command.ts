import { ICommand } from "@nestjs/cqrs";
import { CreateBankAccountDto } from "src/presentation/dtos/bank-accounts/create-bank-acounts.dto";


export class UpdateBankAccountCommand implements ICommand{
    constructor(
        public readonly id: string,
        public readonly createBankAccountDto: CreateBankAccountDto
    ) {}
}