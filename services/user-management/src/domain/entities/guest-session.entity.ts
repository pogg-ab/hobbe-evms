import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { SessionID } from '../value-objects/session-id.value-object';

@Entity()
export class GuestSession {
    @PrimaryGeneratedColumn('uuid')
    session_id: SessionID;

    @Column({ type: 'varchar', length: 255, unique: true })
    session_token: string;

    @Column({ type: 'text', nullable: true })
    device_info: string;

    @Column({ type: 'varchar', length: 45, nullable: true })
    ip_address: string;

    @Column({ type: 'timestamp', nullable: true })
    last_activity: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}