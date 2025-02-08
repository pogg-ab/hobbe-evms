import { ICommand } from "@nestjs/cqrs";
import { ShareEventDto } from "src/presentation/dtos/share-event/share-event.dto";

export class CreateShareEventCommand implements ICommand {
  constructor(
    public readonly user: string,  
    public readonly shareEventDto: ShareEventDto, 
  ) {}
}
