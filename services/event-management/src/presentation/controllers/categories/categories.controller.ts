import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CategoriesCommand } from "src/application/commands/categories/categories.command";
import { DeleteCategoriesCommand } from "src/application/commands/categories/delete-categories.command";
import { UpdatedCategoryCommand } from "src/application/commands/categories/update-categories.command";
import { GetAllCategories } from "src/application/queries/categories/find-all-categories";
import { CategoriesFindById } from "src/application/queries/categories/find-categories-by-id.query";
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
    @HttpCode(200)
    @Post()
    async create(@Body() createCategoriesDto:CreateCategoriesDto): Promise<Categories>{
      const command = new CategoriesCommand(createCategoriesDto);
      return await this.commandBus.execute(command);
    }

    //get all categories

    @ApiOperation({ description:"Get All Categories"})
    @HttpCode(200)
    @Get()
    async findAll(){
       const query = new GetAllCategories();
       return await this.queryBus.execute(query);
    }

    //find one

    @ApiOperation({ description:"Find Category By ID"})
    @HttpCode(200)
    @Get(":id")
    async findOne(@Param("id") id:number){
       const query = new CategoriesFindById(id);
       return await this.queryBus.execute(query);
    }


    @ApiOperation({ description:"Update Category"})
    @ApiBody({type: CreateCategoriesDto})
    @HttpCode(200)
    @Patch(":id")

    async update(@Param("id") id:number,@Body() createCategoriesDto:CreateCategoriesDto){
       const category = await this.queryBus.execute(new CategoriesFindById(id));
       if(!category){
         return "Category Not Found"
       }
       Object.assign(category,createCategoriesDto);

       return await this.commandBus.execute(new UpdatedCategoryCommand(id,category));
    }

    @ApiOperation({ description:"Delete Category"})
    @HttpCode(200)
    @Delete(":id")
    async delete(@Param("id") id:number){
       const category = await this.queryBus.execute(new CategoriesFindById(id));
       if(!category){
         return "Category Not Found"
       }

       return await this.commandBus.execute(new DeleteCategoriesCommand(id));
    }



}