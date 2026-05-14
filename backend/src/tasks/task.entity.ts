import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { StudyModule } from '../modules/module.entity';

@Entity('task')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', nullable: true })
  userId!: number | null;

  @Column({ type: 'int', nullable: true })
  moduleId!: number | null;

  @ManyToOne(() => StudyModule, { nullable: true })
  @JoinColumn({ name: 'moduleId' })
  module!: StudyModule | null;

  @Column()
  text!: string;

  @Column()
  dayKey!: string;

  @Column()
  start!: string;

  @Column()
  end!: string;

  @Column({ default: '' })
  color!: string;

  @Column({ default: '' })
  tag!: string;

  @Column({ default: 'Normal' })
  priority!: string;

  @Column({ default: false })
  done!: boolean;
}
