import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteCategoriesCommand } from "src/application/commands/categories/delete-categories.command";
import { CategoriesService } from "src/application/services/categoriers/categories.service";



@CommandHandler(DeleteCategoriesCommand)

export class DeleteCategoriesCommandHandler implements ICommandHandler<DeleteCategoriesCommand>{

    constructor(
        private readonly categoriesService : CategoriesService
    ){}
    execute(command: DeleteCategoriesCommand): Promise<any> {
       const {id} = command;
       return this.categoriesService.delete(id);
    }
    
}

