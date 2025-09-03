import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Tax } from 'src/domain/entities/tax.entity';
import { ITaxRepository } from 'src/domain/repositories/tax/tax.repository';
import { CreateTaxDto, UpdateTaxDto } from 'src/presentation/dtos/tax/tax.dto';
import { TAX_REPOSITORY_TOKEN } from 'src/domain/repositories/tax/tax.repository.token';

@Injectable()
export class TaxService {
  constructor(
    @Inject(TAX_REPOSITORY_TOKEN)
    private readonly taxRepository: ITaxRepository,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async createTax(createTaxDto: CreateTaxDto, userId: string): Promise<Tax> {
    const tax = this.mapper.map(createTaxDto, CreateTaxDto, Tax);
    return await this.taxRepository.create(tax, userId);
  }

  async getTaxById(taxId: string): Promise<Tax> {
    const tax = await this.taxRepository.findOne(taxId);
    if (!tax) {
      throw new NotFoundException(`Tax with ID ${taxId} not found`);
    }
    return tax;
  }

  async getAllTaxes(
    page: number,
    limit: number,
  ): Promise<{
    taxes: Tax[] | null;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.taxRepository.findAll(page, limit);
    return {
      ...result,
      totalPages: result.taxes ? Math.ceil(result.total / result.limit) : 0,
    };
  }

  async updateTax(
    taxId: string,
    updateTaxDto: UpdateTaxDto,
    userId: string,
  ): Promise<Tax> {
    const tax = await this.taxRepository.findOne(taxId);
    if (!tax) {
      throw new NotFoundException(`Tax with ID ${taxId} not found`);
    }
    const updatedTax = this.mapper.map(updateTaxDto, UpdateTaxDto, Tax);
    return await this.taxRepository.update(taxId, updatedTax, userId);
  }

  async deleteTax(taxId: string, userId: string): Promise<void> {
    await this.taxRepository.delete(taxId, userId);
  }
}
