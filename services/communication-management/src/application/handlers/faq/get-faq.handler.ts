// src/application/queries/handlers/get-faq.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFaqQuery } from '../../queries/faq/get-faq.query';
import { FaqService } from '../../services/faq/faq.service';

@QueryHandler(GetFaqQuery)
export class GetFaqHandler implements IQueryHandler<GetFaqQuery> {
  constructor(private readonly service: FaqService) {}

  async execute(query: GetFaqQuery) {
    return this.service.getFaqById(query.faqId);
  }
}
