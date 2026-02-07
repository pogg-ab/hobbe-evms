

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IsEnum } from "class-validator";


export enum RefundStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PROCESSED = 'PROCESSED',
    FAILED = 'FAILED'
}

@Entity()
export class RefundRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;  

    @Column()
    paymentid: string;
   

    @Column()
    userid: string;
   
  
    @Column()
    eventid: string;

    @Column('decimal', { precision: 18, scale: 2 })
    amount: number;

    @Column()
    currency: string;

    @Column({ type: 'text', nullable: true })
    reason: string;


    @Column({ type: 'varchar', length: 20, default: RefundStatus.PENDING })
    @IsEnum(RefundStatus)
    status: RefundStatus
    
    @Column({ type: 'int', default: 0 })
    approval_level: number; // 0 = none, 1 = manager-approved


    @Column({ type: 'uuid', nullable: true })
    approved_by: string;


    @Column({ type: 'timestamptz', default: () => 'NOW()' })
    requested_at: Date;

    @Column({ type: 'timestamptz', nullable: true })
    approved_at: Date   

    @Column({ type: 'timestamptz', nullable: true })
    processed_at: Date  

    @Column({ type: 'varchar', length: 255, nullable: true })
    payment_gateway_ref: string

    @Column({ type: 'timestamptz', default: () => 'NOW()' })
    created_at: Date;

    @Column({ type: 'timestamptz', default: () => 'NOW()' })
    updated_at: Date; 
}


