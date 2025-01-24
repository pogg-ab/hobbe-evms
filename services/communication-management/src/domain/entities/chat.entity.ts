import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Chat{

    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    sender_id: string;

    @Column()
    room: string;

    @Column({type:"text", nullable:true})
    text: string;

    @Column({nullable:true})
    file: string;

    @Column({nullable:true})
    audio: string;
    
    @Column({type:"timestamp", default: () => "CURRENT_TIMESTAMP"})
    created_at: Date;

    @Column({type:"timestamp", nullable: true})
    updated_at: Date;

    @Column({nullable:true})
    readBy: string;

    @Column({type:"timestamp", nullable: true})
    deleted_at: Date;

    



 

}