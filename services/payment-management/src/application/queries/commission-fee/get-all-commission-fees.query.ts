export class GetAllCommissionFeesQuery {
    constructor(
        public readonly page: number,
        public readonly limit: number,
    ) { }
}