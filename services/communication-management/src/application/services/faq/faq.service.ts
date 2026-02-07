// src/application/services/faq.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { SupportFaq } from '../../../domain/entities/support-faq.entity';
import { CreateFaqDto } from '../../../presentation/dto/faq/create-faq.dto';
import { UpdateFaqDto } from '../../../presentation/dto/faq/update-faq.dto';
import { FaqResponseDto } from '../../../presentation/dto/faq/faq-response.dto';
import { ISupportFaqRepository } from '../../../domain/repositories/faq/support-faq.repository';
import { ISupportFaqRepository as ISupportFaqRepositoryToken } from '../../../domain/repositories/faq/i-support-faq.repository.token';

@Injectable()
export class FaqService {
  constructor(
    @Inject(ISupportFaqRepositoryToken) private faqRepo: ISupportFaqRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createFaq(userId: string, dto: CreateFaqDto): Promise<FaqResponseDto> {
    const ent: Partial<SupportFaq> = {
      title: dto.title,
      content: dto.content,
      tags: dto.tags,
      created_by: userId,
    };
    const saved = await this.faqRepo.create(ent);
    return this.mapper.map(saved, SupportFaq, FaqResponseDto);
  }

  async updateFaq(id: string, dto: UpdateFaqDto): Promise<FaqResponseDto> {
    const existing = await this.faqRepo.findById(id);
    if (!existing) {
      throw new Error('FAQ not found');
    }
    if (dto.title !== undefined) existing.title = dto.title;
    if (dto.content !== undefined) existing.content = dto.content;
    if (dto.tags !== undefined) existing.tags = dto.tags;
    const saved = await this.faqRepo.update(existing);
    return this.mapper.map(saved, SupportFaq, FaqResponseDto);
  }

  async deleteFaq(id: string): Promise<void> {
    const existing = await this.faqRepo.findById(id);
    if (!existing) {
      throw new Error('FAQ not found');
    }
    await this.faqRepo.delete(id);
  }

  async listFaqs(q?: { search?: string; tags?: string[]; page?: number; limit?: number }) {
    return this.faqRepo.findAll(q);
  }

  async getFaqById(id: string): Promise<FaqResponseDto | null> {
    const f = await this.faqRepo.findById(id);
    if (!f) return null;
    return this.mapper.map(f, SupportFaq, FaqResponseDto);
  }
}
