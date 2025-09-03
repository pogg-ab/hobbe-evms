import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tax } from 'src/domain/entities/tax.entity';
import { ITaxRepository } from 'src/domain/repositories/tax/tax.repository';
import { TaxIdValueObject } from 'src/domain/value-objects/tax-id.value-object';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TaxRepositoryImpl implements ITaxRepository {
    constructor(
        @InjectRepository(Tax)
        private readonly taxRepository: Repository<Tax>,
    ) { }

    async create(tax: Tax, userId: string): Promise<Tax> {
        tax.tax_id = new TaxIdValueObject(uuidv4());
        tax.created_by = userId;
        tax.created_at = new Date();
        return await this.taxRepository.save(tax);
    }

    async findOne(taxId: string): Promise<Tax | null> {
        return await this.taxRepository.findOne({ where: { tax_id: taxId } });
    }

    async findAll(page: number, limit: number): Promise<{ taxes: Tax[] | null; total: number; page: number; limit: number }> {
        const [taxes, total] = await this.taxRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
        return { taxes: taxes.length ? taxes : null, total, page, limit };
    }

    async update(taxId: string, tax: Partial<Tax>, userId: string): Promise<Tax> {
        const existingTax = await this.findOne(taxId);
        if (!existingTax) {
            throw new NotFoundException(`Tax with ID ${taxId.toString()} not found`);
        }
        Object.assign(existingTax, tax);
        existingTax.updated_by = userId;
        existingTax.updated_at = new Date();
        return await this.taxRepository.save(existingTax);
    }

    async delete(taxId: string, userId: string): Promise<void> {
        const existingTax = await this.findOne(taxId);
        if (!existingTax) {
            throw new NotFoundException(`Tax with ID ${taxId.toString()} not found`);
        }
        await this.taxRepository.delete(taxId.toString());
    }
}