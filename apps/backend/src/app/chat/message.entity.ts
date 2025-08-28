import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../users/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(() => Conversation, { nullable: false })
  conversation!: Conversation;

  @ManyToOne(() => User, { nullable: true, eager: true })
  author?: User | null;

  @Column() direction!: 'USER' | 'ADMIN';
  @Column({ type: 'text' }) body!: string;

  @CreateDateColumn() createdAt!: Date;
  @Column({ default: false }) readByUser!: boolean;
  @Column({ default: false }) readByAdmin!: boolean;
}
