import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdatedCategoryCommand } from "src/application/commands/categories/update-categories.command";
import { CategoriesService } from "src/application/services/categoriers/categories.service";
import { Categories } from "src/domain/entities/categories.entity";


@CommandHandler(UpdatedCategoryCommand)

export class UpdatedCategoryCommandHandler implements ICommandHandler<UpdatedCategoryCommand>{
    constructor(
        private readonly categoriesService : CategoriesService
    ){}
    execute(command: UpdatedCategoryCommand): Promise<Categories> {
       const {id, createCategoriesDto} = command;
       return this.categoriesService.update(id,createCategoriesDto)
    }
    
}