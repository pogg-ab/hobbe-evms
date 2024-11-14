import { ICommand } from "@nestjs/cqrs";
import { CreateEventsDto } from "src/presentation/dtos/create-events.dto";


export class CreateEventCommand implements ICommand{
    constructor(public readonly createEventsDto: CreateEventsDto) {}
}