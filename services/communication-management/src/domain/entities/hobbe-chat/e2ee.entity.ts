import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatUser } from "./chat-user.entity";

@Entity()
export class E2EE{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => ChatUser, (user) => user.key)
    @JoinColumn({ name: 'user' })
    user: string;
    

    @Column({type:'text'})
    public_key: string;

    @Column({type:'text'})
    private_key: string;
}