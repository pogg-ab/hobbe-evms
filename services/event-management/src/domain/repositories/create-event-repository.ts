import { CreateEventsDto } from "src/presentation/dtos/create-events.dto";
import { Events } from "../entities/events.entity";


export interface ICreateEventRepository{
    create(createEventsDto: CreateEventsDto): Promise<Events>;
    findAll():Promise<Events[]>
}