import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('verification_code')
export class VerificationCode {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  email!: string;

  @Column()
  code!: string;

  @Column()
  expireEn!: Date;
}
