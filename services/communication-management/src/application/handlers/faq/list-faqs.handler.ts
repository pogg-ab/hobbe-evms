// src/application/queries/handlers/list-faqs.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListFaqsQuery } from '../../queries/faq/list-faqs.query';
import { FaqService } from '../../services/faq/faq.service';

@QueryHandler(ListFaqsQuery)
export class ListFaqsHandler implements IQueryHandler<ListFaqsQuery> {
  constructor(private readonly service: FaqService) {}

  async execute(query: ListFaqsQuery) {
    return this.service.listFaqs(query.query);
  }
}
