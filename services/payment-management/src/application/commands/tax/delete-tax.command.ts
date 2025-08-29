export class DeleteTaxCommand {
    constructor(
        public readonly taxId: string,
        public readonly userId: string,
    ) { }
}