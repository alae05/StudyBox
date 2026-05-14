import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('study_sessions')
export class StudySession {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  moduleId!: number;

  @Column()
  durationMinutes!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
