import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  moduleId!: number;

  @Column()
  userId!: number;

  @Column()
  nomOriginal!: string;

  @Column()
  nomFichier!: string;

  @Column({ default: '' })
  extension!: string; 

  @Column({ default: 'application/octet-stream' })
  typeMime!: string;

  @Column({ type: 'bigint', default: 0 })
  taille!: number;
  @Column()
  chemin!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
