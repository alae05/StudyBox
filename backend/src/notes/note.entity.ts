import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { StudyModule } from '../modules/module.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'int', nullable: true })
  moduleId!: number | null;

  @ManyToOne(() => StudyModule, { nullable: true })
  @JoinColumn({ name: 'moduleId' })
  module!: StudyModule | null;

  @Column({ type: 'varchar', default: 'Sans titre' })
  titre!: string;

  @Column({ type: 'text', nullable: true })
  contenu!: string;

  @Column({ type: 'varchar', default: '' })
  matiere!: string;

  @Column({ type: 'varchar', default: '' })
  tags!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
