import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('downloads')
export class DownloadEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  platform: 'android' | 'ios' | 'web' | 'desktop';

  @Column()
  deviceType: string;

  @Column()
  osVersion: string;

  @Column()
  country: string;

  @CreateDateColumn()
  collectedAt: Date;
}