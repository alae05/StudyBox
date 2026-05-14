import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('revision_sessions')
export class RevisionSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  moduleId: number;

  @Column({
    type: 'enum',
    enum: ['flashcards', 'quiz', 'active'],
    default: 'flashcards',
  })
  mode: string;

  @Column({ default: 0 })
  totalQuestions: number;

  @Column({ default: 0 })
  correctAnswers: number;

  @Column({ type: 'tinyint', default: 0 })
  terminee: number;

  @CreateDateColumn()
  createdAt: Date;
}
