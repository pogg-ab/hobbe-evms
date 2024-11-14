import { CreateEventsDto } from "src/presentation/dtos/create-events.dto";
import { Events } from "../../entities/events.entity";


export interface IEventRepository{
    create(createEventsDto: CreateEventsDto): Promise<Events>;
    findAll():Promise<Events[]>
    findOne(id:string):Promise<Events | null>
    update(id:string,event: Events): Promise<Events>
    delete(id:string): Promise<void>
}