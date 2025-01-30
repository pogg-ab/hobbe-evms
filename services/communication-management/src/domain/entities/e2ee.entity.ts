import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class E2EE{

    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    user_id: string;

    @Column({type:'text'})
    public_key: string;

    @Column({type:'text'})
    private_key: string;
}