
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QuizQuestion } from './quiz-question.entity';

@Entity('quiz_options')
export class QuizOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  questionId: number;

  @Column({ length: 255 })
  label: string;

  @Column({ type: 'tinyint', default: 0 })
  isCorrect: boolean;

  @Column({ default: 0 })
  ordre: number;

  @ManyToOne(() => QuizQuestion, (q) => q.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: QuizQuestion;
}
