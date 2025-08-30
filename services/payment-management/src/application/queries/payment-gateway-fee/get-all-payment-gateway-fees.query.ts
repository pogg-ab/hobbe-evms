export class GetAllPaymentGatewayFeesQuery {
    constructor(
        public readonly page: number,
        public readonly limit: number,
    ) { }
}