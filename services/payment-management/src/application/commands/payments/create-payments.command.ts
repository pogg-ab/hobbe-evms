import { ICommand } from "@nestjs/cqrs";
import { CreatePaymentDto } from "src/presentation/dtos/payments/create-payments.dto";


export class CreatePaymentCommand implements ICommand{
    constructor(
        public readonly createPaymentDto: CreatePaymentDto
    ) {}
}