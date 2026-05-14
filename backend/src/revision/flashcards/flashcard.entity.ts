
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('flashcards')
export class Flashcard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  moduleId: number;

  @Column()
  userId: number;

  @Column({ length: 50, default: '' })
  tag: string;

  @Column('text')
  question: string;

  @Column('text')
  answer: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hint!: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
