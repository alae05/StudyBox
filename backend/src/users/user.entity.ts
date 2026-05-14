import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nom!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  motDePasse!: string;

  @Column({ default: "Cycle d ingénieur" })
  niveau!: string;

  @Column({ default: 'FST Mohammedia' })
  ecole!: string;

  @Column({ default: 0 })
  streak!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'datetime', nullable: true, default: null })
  lastActive!: Date | null;
}