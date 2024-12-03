import { ICommand } from "@nestjs/cqrs";
import { UpdateEventsDto } from "src/presentation/dtos/events/update-events.dto";

export class UpdateEventsCommand implements ICommand {
    constructor(
        public readonly id: string, 
        public readonly updateEventsDto: UpdateEventsDto,
        public readonly user: any,
    ) {}
}