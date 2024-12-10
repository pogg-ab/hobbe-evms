import { ICommand } from "@nestjs/cqrs";
import { CreateCategoriesDto } from "src/presentation/dtos/categories/categories.dto";


export class CategoriesCommand implements ICommand{
    constructor(public readonly categoriesDto:CreateCategoriesDto) {}
}