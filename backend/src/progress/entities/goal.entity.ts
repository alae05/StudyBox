import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user_goals')
export class Goal {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  title!: string;

  @Column({ type: 'date' })
  targetDate!: string;

  @Column({ default: 0 })
  currentProgress!: number;

  @Column({ default: 100 })
  targetValue!: number;

  @Column({
    type: 'enum',
    enum: ['in-progress', 'completed'],
    default: 'in-progress',
  })
  status!: string;
}
