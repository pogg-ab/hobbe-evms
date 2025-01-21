import { IQuery } from "@nestjs/cqrs";



export class CategoriesFindById implements IQuery{
    
    constructor(public readonly id: number) {}
}