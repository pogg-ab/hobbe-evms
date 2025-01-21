import { ICommand } from "@nestjs/cqrs";
import { CreatePromocodeDto } from "src/presentation/dtos/tickets/create-promocode.dto";



export class CreatePromocodeCommand implements ICommand{
    constructor(
        public readonly createPromocodeDto:CreatePromocodeDto
    ){}
}