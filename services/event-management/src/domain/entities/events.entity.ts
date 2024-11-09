import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Events {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;
    
    @Column()
    location: string;

    @Column({ enum: ['public', 'private', 'group'] })
    privacy: string;

    @Column({default:'drafted', enum: ['drafted', 'pending', 'cancelled','rejected','postponed','active'] })
    status: string;

    @Column()
    event_start_date: Date;

    @Column()
    event_end_date: Date;

    @Column({nullable:true})
    catagory: string;

    @Column({nullable: true })
    created_by: string;

    @Column({nullable: true  })
    update_by: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
    updated_att: Date;
}
