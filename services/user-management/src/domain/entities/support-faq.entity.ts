
// src/domain/entities/support-faq.entity.ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'support_faqs' })
export class SupportFaq {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
