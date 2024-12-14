import { Promocodes } from "src/domain/entities/promocodes.entity";
import { CreatePromocodeDto } from "src/presentation/dtos/tickets/create-promocode.dto";


export interface IPromocode{
    create(createPromocodeDto:CreatePromocodeDto):Promise<Promocodes>
    findAll():Promise<Promocodes[]>
    findOne(id:number):Promise<Promocodes | null>
    update(id:number, promocode:Promocodes):Promise<Promocodes>
}