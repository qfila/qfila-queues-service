import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Queue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 63 })
  title: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @Column({ length: 255 })
  description: string;

  @Column({ type: 'smallint', name: 'average_wait_time_in_minutes' })
  averageWaitTimeInMinutes: number;

  @Column({ type: 'smallint', name: 'max_participants' })
  maxParticipants: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
