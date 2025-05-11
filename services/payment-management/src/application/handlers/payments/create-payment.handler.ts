import { CommandHandler } from "@nestjs/cqrs";
import { CreatePaymentCommand } from "src/application/commands/payments/create-payments.command";
import { BankAccountsServices } from "src/application/services/bank-accounts/bank-accounts.service";
import { PaymentsService } from "src/application/services/payments/payments.service";
import { BankAccounts } from "src/domain/entities/bank_accounts.entity";


@CommandHandler(CreatePaymentCommand)

export class CreateBankAccountHandler{
    constructor(
        private readonly paymentsService: PaymentsService
    ){}
    async execute(command: CreatePaymentCommand): Promise<any>{
        const {createPaymentDto} = command;
        return await this.paymentsService.create(createPaymentDto);
    }
}