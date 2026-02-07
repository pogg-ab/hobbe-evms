import { CreateCommissionFeeDto } from "src/presentation/dtos/commission-fee/commission-fee.dto";

export class CreateCommissionFeeCommand {
    constructor(
        public readonly createCommissionFeeDto: CreateCommissionFeeDto,
        public readonly userId: string,
    ) { }
}