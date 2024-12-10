import { Body, Controller, Inject, Post } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CategoriesCommand } from "src/application/commands/categories/categories.command";
import { Categories } from "src/domain/entities/categories.entity";
import { CreateCategoriesDto } from "src/presentation/dtos/categories/categories.dto";



@ApiTags("Categories")
@Controller("categories")
export class CategoriesController{
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
      ) {}

    // Create a new category
    @ApiBody({ type: CreateCategoriesDto })
    @ApiOperation({ description: 'Create a new Categories' })
    @Post()
    async create(@Body() createCategoriesDto:CreateCategoriesDto): Promise<Categories>{
      const command = new CategoriesCommand(createCategoriesDto);
      return await this.commandBus.execute(command);
    }



}