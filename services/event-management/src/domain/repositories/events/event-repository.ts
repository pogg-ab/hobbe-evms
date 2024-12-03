import { CreateEventsDto } from "src/presentation/dtos/events/create-events.dto";
import { Events } from "../../entities/events.entity";
import { promises } from "dns";


export interface IEventRepository{
    create(createEventsDto: CreateEventsDto): Promise<Events>;
    findAll( page:number, limit:number):Promise<{events:Events[]| null,total: number; page: number; limit: number}>
    findOne(id:string):Promise<Events | null>
    findByCategory(category:string):Promise<Events[]>
    findByLocation(location:string):Promise<Events[]>
    update(id:string,event: Events): Promise<Events>
    delete(id:string): Promise<void>

    // searching for events
    search(keyword:string,page:number,limit:number):Promise<{events:Events[] | null,total:number, page: number; limit: number}>
}