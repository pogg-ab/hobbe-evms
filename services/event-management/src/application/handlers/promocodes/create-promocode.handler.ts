import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreatePromocodeCommand } from "src/application/commands/promocodes/create-promocode.command";
import { PromocodeServices } from "src/application/services/tickets/promocode/promocode.service";
import { Promocodes } from "src/domain/entities/promocodes.entity";


@CommandHandler(CreatePromocodeCommand)

export class CreatePromocodeCommandHandler implements ICommandHandler<CreatePromocodeCommand>{
    constructor(
        private readonly promocodeServices:PromocodeServices
    ){}
    execute(command: CreatePromocodeCommand): Promise<Promocodes> {
        const {createPromocodeDto } = command;
        return this.promocodeServices.create(createPromocodeDto);
    }

}