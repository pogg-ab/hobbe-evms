// src/domain/repositories/support-faq.repository.interface.ts
import { SupportFaq } from '../entities/support-faq.entity';

export interface ISupportFaqRepository {
  create(faq: Partial<SupportFaq>): Promise<SupportFaq>;
  update(faq: SupportFaq): Promise<SupportFaq>;
  findAll(q?: { search?: string; tags?: string[]; page?: number; limit?: number }): Promise<[SupportFaq[], number]>;
  findById(id: string): Promise<SupportFaq | null>;
  delete(id: string): Promise<void>;
}
