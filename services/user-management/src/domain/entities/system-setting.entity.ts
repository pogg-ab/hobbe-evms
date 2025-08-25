// src/domain/entities/system-setting.entity.ts
import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'system_settings' })
export class SystemSetting {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @UpdateDateColumn()
  updated_at: Date;
}