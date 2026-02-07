export class GetAllTaxesQuery {
    constructor(
        public readonly page: number,
        public readonly limit: number,
    ) { }
}