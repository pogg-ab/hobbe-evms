import { Tax } from 'src/domain/entities/tax.entity';

export interface ITaxRepository {
    create(tax: Tax, userId: string): Promise<Tax>;
    findOne(taxId: string): Promise<Tax | null>;
    findAll(page: number, limit: number): Promise<{ taxes: Tax[] | null; total: number; page: number; limit: number }>;
    update(taxId: string, tax: Partial<Tax>, userId: string): Promise<Tax>;
    delete(taxId: string, userId: string): Promise<void>;
}