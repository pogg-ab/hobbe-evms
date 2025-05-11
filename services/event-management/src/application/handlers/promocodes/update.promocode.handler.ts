import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdatePromocodeCommand } from "src/application/commands/promocodes/updaet-promocode.command";
import { PromocodeServices } from "src/application/services/tickets/promocode/promocode.service";
import { Promocodes } from "src/domain/entities/promocodes.entity";


@CommandHandler(UpdatePromocodeCommand)

export class UpdatePromocodeCommandHandler implements ICommandHandler<UpdatePromocodeCommand>{
    constructor(
        private readonly promocodeServices:PromocodeServices
    ){}
    execute(command: UpdatePromocodeCommand): Promise<Promocodes> {
        const {id, promocode} = command;
        return this.promocodeServices.update(id,promocode);
    }
    
}