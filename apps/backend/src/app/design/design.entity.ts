import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Design {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(() => User, { eager: false, nullable: false })
  user!: User;

  @Column({ type: 'text', nullable: true })
  message?: string | null;

  @Column({ type: 'text' })
  imagePath!: string;

  @Column({ type: 'jsonb', nullable: true })
  scene?: any;
  @Column({ type: 'text', nullable: true }) 
  exampleImage?: string | null;


  @CreateDateColumn()
  createdAt!: Date;
}
