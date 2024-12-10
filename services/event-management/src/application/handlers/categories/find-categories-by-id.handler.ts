import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CategoriesFindById } from "src/application/queries/categories/find-categories-by-id.query";
import { CategoriesService } from "src/application/services/categoriers/categories.service";
import { Categories } from "src/domain/entities/categories.entity";


@QueryHandler(CategoriesFindById)

export class CategoriesFindByIdHandler implements IQueryHandler<Categories>{
    constructor(
        private readonly categoriesService : CategoriesService
    ){}
    execute(query: Categories): Promise<Categories> {
       const {id} = query;
       return this.categoriesService.findOne(id);
    }

}