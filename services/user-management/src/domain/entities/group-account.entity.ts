import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { UserID } from '../value-objects/user-id.value-object';
import { GroupAccountID } from '../value-objects/group-account-id.value-object';

@Entity('group_account')
@Index(['primary_user_id', 'linked_user_id'], { unique: true })
export class GroupAccount {
    @PrimaryGeneratedColumn('uuid')
    group_account_id: GroupAccountID;

    @Column({ name: 'primary_user_id' })
    primary_user_id: UserID;

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'primary_user_id' })
    primary_organizer: User;

    @Column({ name: 'linked_user_id' })
    linked_user_id: UserID;

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'linked_user_id' })
    linked_organizer: User;

    @CreateDateColumn({ default: () => 'NOW()' })
    created_at: Date;

    @Column({ nullable: true })
    created_by: string;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ nullable: true })
    updated_by: string;
}