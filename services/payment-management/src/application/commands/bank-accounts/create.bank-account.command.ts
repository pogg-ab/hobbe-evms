import { ICommand } from "@nestjs/cqrs";
import { CreateBankAccountDto } from "src/presentation/dtos/bank-accounts/create-bank-acounts.dto";


export class CreateBankAccountCommand implements ICommand{
    constructor(
        public readonly user: any,
        public readonly event: string,
        public readonly createBankAccountDto: CreateBankAccountDto
    ) {}
}