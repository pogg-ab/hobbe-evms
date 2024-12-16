import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Events } from "./events.entity";

@Entity()
export class Categories{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({nullable:true})
    description: string;

    @ManyToMany(()=>Events ,(event) => event.categories)
    events:Events[]
}