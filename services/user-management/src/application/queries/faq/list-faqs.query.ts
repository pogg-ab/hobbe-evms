// src/application/queries/list-faqs.query.ts
export class ListFaqsQuery {
  constructor(public readonly query?: { search?: string; tags?: string[]; page?: number; limit?: number }) {}
}
