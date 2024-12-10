import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { Inject, Injectable } from "@nestjs/common";
import { Categories } from "src/domain/entities/categories.entity";
import { ICategoriesRepository } from "src/domain/repositories/categories/categories.repository";
import { CATEGORIES_REPOSITORY_TOKEN } from "src/domain/repositories/categories/categories.repository.token";
import { CreateCategoriesDto } from "src/presentation/dtos/categories/categories.dto";


@Injectable()
export class CategoriesService{
    constructor(
        @Inject(CATEGORIES_REPOSITORY_TOKEN)
        private readonly categoriesRepository : ICategoriesRepository,
        @InjectMapper() private readonly mapper: Mapper,
        
    ) { }

    async create(createCategoriesDto: CreateCategoriesDto):Promise<Categories>{
        const categories  = this.mapper.map(createCategoriesDto,CreateCategoriesDto,Categories);
        return this.categoriesRepository.create(categories);
    }

    async findOne(id:number):Promise<Categories | null>{
        return this.categoriesRepository.findOne(id);
    }
}