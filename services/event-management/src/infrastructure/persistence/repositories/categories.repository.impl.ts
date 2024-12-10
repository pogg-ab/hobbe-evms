import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Categories } from "src/domain/entities/categories.entity";
import { ICategoriesRepository } from "src/domain/repositories/categories/categories.repository";
import { CreateCategoriesDto } from "src/presentation/dtos/categories/categories.dto";
import { Repository } from "typeorm";


@Injectable()

export class CategoriesRepositoryImpl implements ICategoriesRepository{

    constructor(
        @InjectRepository(Categories)
        private readonly categoriesRepository : Repository<Categories>
    ){}
    

    async create(categoriesDto: CreateCategoriesDto):Promise<Categories>{
        return this.categoriesRepository.save(categoriesDto);
    }

    
}