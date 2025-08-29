import { CreateTaxDto } from "src/presentation/dtos/tax/tax.dto";

export class CreateTaxCommand {
    constructor(
        public readonly createTaxDto: CreateTaxDto,
        public readonly userId: string,
    ) { }
}