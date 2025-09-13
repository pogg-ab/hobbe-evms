// src/infrastructure/persistence/repositories/support-faq.repository.ts
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SupportFaq } from '../../../domain/entities/support-faq.entity';
import { ISupportFaqRepository } from '../../../domain/repositories/support-faq.repository';
import { Repository } from 'typeorm';

@Injectable()
export class SupportFaqRepositoryImpl implements ISupportFaqRepository {
  constructor(
    @InjectRepository(SupportFaq)
    private readonly repo: Repository<SupportFaq>,
  ) {}

  async create(faq: Partial<SupportFaq>): Promise<SupportFaq> {
    try {
      const ent = this.repo.create(faq);
      return await this.repo.save(ent);
    } catch (error) {
      throw new HttpException(`Error creating FAQ: ${error?.message ?? error}`, 500);
    }
  }

  async update(faq: SupportFaq): Promise<SupportFaq> {
    try {
      const existing = await this.repo.findOne({ where: { id: faq.id } });
      if (!existing) throw new NotFoundException(`FAQ ${faq.id} not found`);
      Object.assign(existing, faq);
      return await this.repo.save(existing);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(`Error updating FAQ: ${error?.message ?? error}`, 500);
    }
  }

  async findAll(q?: { search?: string; tags?: string[]; page?: number; limit?: number }): Promise<[SupportFaq[], number]> {
    try {
      const qb = this.repo.createQueryBuilder('f');
      if (q?.search) {
        qb.where('f.title ILIKE :s OR f.content ILIKE :s', { s: `%${q.search}%` });
      }
      if (q?.tags && q.tags.length) {
        qb.andWhere('f.tags && :tags', { tags: q.tags });
      }
      qb.orderBy('f.created_at', 'DESC');
      const page = q?.page ?? 1;
      const limit = q?.limit ?? 20;
      qb.skip((page - 1) * limit).take(limit);
      const [items, count] = await qb.getManyAndCount();
      return [items, count];
    } catch (error) {
      throw new HttpException(`Error fetching FAQs: ${error?.message ?? error}`, 500);
    }
  }

  async findById(id: string): Promise<SupportFaq | null> {
    try {
      return await this.repo.findOne({ where: { id } });
    } catch (error) {
      throw new HttpException(`Error fetching FAQ: ${error?.message ?? error}`, 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const res = await this.repo.delete({ id });
      if (res.affected === 0) {
        throw new NotFoundException(`FAQ ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(`Error deleting FAQ: ${error?.message ?? error}`, 500);
    }
  }
}
