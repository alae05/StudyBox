import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('modules')
export class StudyModule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column({ type: 'int', nullable: true, default: null })
  phaseId!: number | null;

  @Column()
  nom!: string;

  @Column({ default: 'calculator' })
  icone!: string;

  @Column({ default: '#06b6d4' })
  couleur!: string;

  @Column({ type: 'text', nullable: true, default: null })
  description!: string;

  @Column({ default: 'Autre' })
  category!: string;

  @Column({ default: '' })
  semester!: string;

  @Column({ default: 0 })
  progress!: number;

  @Column({ default: 0 })
  totalHours!: number;

  @Column({
    type: 'datetime',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastActivity!: Date | null;

  @Column({ type: 'text', nullable: true, default: null })
  notes!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
