import { Categories } from "src/domain/entities/categories.entity";
import { CreateCategoriesDto } from "src/presentation/dtos/categories/categories.dto";


export interface ICategoriesRepository {
    create(catergoriesDto:CreateCategoriesDto):Promise<Categories>
    findAll():Promise<Categories[]>
    findOne(id:number):Promise<Categories | null>
    update(id:number, categories:Categories):Promise<Categories>
    delete(id:number):Promise<void>
}