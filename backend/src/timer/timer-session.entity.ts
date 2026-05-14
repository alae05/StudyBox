import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('timer_sessions')
export class TimerSession {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column({ type: 'int', nullable: true, default: null })
  moduleId!: number | null;

  @Column({ default: "Session d étude" })
  sujet!: string;

  @Column()
  dureeMinutes!: number;

  @Column({ default: 0 })
  dureeReelleMinutes!: number;

  @Column({ default: false })
  terminee!: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
