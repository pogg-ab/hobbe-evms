import { ICommand } from "@nestjs/cqrs";


export class DeleteCategoriesCommand implements ICommand{
    constructor(
        public readonly id:number
    ){}
}