import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type ContactStatus = 'NEW' | 'READ' | 'REPLIED';

@Entity()
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ type: 'text' }) name!: string;
  @Column({ type: 'text' }) email!: string;
  @Column({ type: 'text' }) message!: string;

  @Column({ type: 'varchar', default: 'NEW' })
  status!: ContactStatus;

  @Column({ type: 'text', nullable: true })
  replyText?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  repliedAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
