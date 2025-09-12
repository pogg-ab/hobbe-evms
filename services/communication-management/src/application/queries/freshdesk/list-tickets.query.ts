export class ListTicketsQuery {
    constructor(
        public readonly page?: number,
        public readonly perPage?: number,
        public readonly status?: number,
        public readonly priority?: number,
    ) { }
}