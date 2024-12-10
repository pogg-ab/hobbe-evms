import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CategoriesCommand } from "src/application/commands/categories/categories.command";
import { CategoriesService } from "src/application/services/categoriers/categories.service";
import { Categories } from "src/domain/entities/categories.entity";


@CommandHandler(CategoriesCommand)
export class CategoriesCommandHandler implements ICommandHandler<CategoriesCommand> {
    constructor(
        private readonly categoriesService: CategoriesService
    ){
    }
    async execute(command: CategoriesCommand): Promise<Categories> {
        const { categoriesDto} = command;
        return  this.categoriesService.create(categoriesDto);       
    }
}