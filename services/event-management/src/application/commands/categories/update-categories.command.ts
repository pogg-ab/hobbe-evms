import { ICommand } from "@nestjs/cqrs";
import { CreateCategoriesDto } from "src/presentation/dtos/categories/categories.dto";


export class UpdatedCategoryCommand implements ICommand{
    constructor(
        public readonly id: number,
        public readonly createCategoriesDto: CreateCategoriesDto,
    ){}
}