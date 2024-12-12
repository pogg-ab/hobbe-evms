import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllCategories } from "src/application/queries/categories/find-all-categories";
import { CategoriesService } from "src/application/services/categoriers/categories.service";
import { Categories } from "src/domain/entities/categories.entity";


@QueryHandler(GetAllCategories)

export class GetAllCategoriesHandler implements IQueryHandler<GetAllCategories>{
    constructor(
        private readonly categoriesService : CategoriesService
    ){}
    execute(query: GetAllCategories): Promise<Categories[]> {
       return this.categoriesService.findAll();
    }
}