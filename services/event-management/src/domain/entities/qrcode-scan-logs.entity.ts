import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tickets } from "./tickets.entity";

@Entity()
export class QrScanLogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tickets, ticket => ticket.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Tickets;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  scanned_at: Date;

  @Column({ nullable: true })
  action_taken: string; // e.g., "visited_event_page", "redeemed_promo"

  @Column({ nullable: true })
  metadata: string; // optional data like IP address, device, etc.
}
