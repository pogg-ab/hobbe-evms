import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindOnePoromocodeQuery } from "src/application/queries/promocodes/find-one-promocode.query";
import { PromocodeServices } from "src/application/services/tickets/promocode/promocode.service";
import { Promocodes } from "src/domain/entities/promocodes.entity";



@QueryHandler(FindOnePoromocodeQuery)

export class FindOnePoromocodeQueryHandler implements IQueryHandler<FindOnePoromocodeQuery>{
    constructor(
        public readonly promocodeServices :PromocodeServices
    ){}
    execute(query: FindOnePoromocodeQuery): Promise<Promocodes | null> {
        const {id} = query;
        return this.promocodeServices.findOne(id);
    }

}