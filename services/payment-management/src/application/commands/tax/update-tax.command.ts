import { UpdateTaxDto } from "src/presentation/dtos/tax/tax.dto";

export class UpdateTaxCommand {
    constructor(
        public readonly taxId: string,
        public readonly updateTaxDto: UpdateTaxDto,
        public readonly userId: string,
    ) { }
}