import { CreateEventsDto } from "src/presentation/dtos/events/create-events.dto";
import { Events } from "../../entities/events.entity";


export interface IEventRepository{
    create(createEventsDto: CreateEventsDto): Promise<Events>;
    findAll():Promise<Events[]>
    findOne(id:string):Promise<Events | null>
    findByCategory(category:string):Promise<Events[]>
    findByLocation(location:string):Promise<Events[]>
    update(id:string,event: Events): Promise<Events>
    delete(id:string): Promise<void>
}