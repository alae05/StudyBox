import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { QuizOption } from './quiz-option.entity';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  moduleId: number;

  @Column()
  userId: number;

  @Column('text')
  question: string;

  @Column('text', { nullable: true })
  explanation: string | null;

  @OneToMany(() => QuizOption, (opt) => opt.question, {
    cascade: true,
    eager: true, // options always loaded with the question
  })
  options: QuizOption[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
