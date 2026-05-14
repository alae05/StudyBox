import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('card_progress')
export class CardProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  flashcardId: number;

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: 0 })
  correctCount: number;

  @Column({ type: 'enum', enum: ['easy', 'medium', 'hard'], nullable: true })
  ease: string;

  @Column({ type: 'datetime', nullable: true })
  nextReviewAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
