import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Message } from './message.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(() => User, { nullable: true, eager: true })
  user?: User | null;

  @Column({ default: 'OPEN' }) status!: 'OPEN' | 'CLOSED';

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactName?: string | null;

  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;

  @OneToMany(() => Message, (m) => m.conversation)
  messages!: Message[];
}
