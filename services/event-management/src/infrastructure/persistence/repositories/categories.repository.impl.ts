import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
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

    async findOne(id:number):Promise<Categories | null>{

        try{
            const category =  await this.categoriesRepository.findOne({
                where:{id:id}
            });
    
            if(!category){
                throw new HttpException(
                    `Category with id ${id} not found`,
                    HttpStatus.NOT_FOUND,
                );
            }
        return category;
        }catch(error){
            throw new HttpException(
               `Error fetching Categories with ID ${id}: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        
    }

    
}