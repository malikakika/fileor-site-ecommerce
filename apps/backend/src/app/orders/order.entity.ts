import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { OrderItem } from './orderItem.entity';

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELED';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(() => User) user!: User;

  @Column({ type: 'varchar', default: 'PENDING' }) status!: OrderStatus;
  @Column('int') totalCents!: number;
  @Column({ default: 'EUR' }) currency!: string;

  @OneToMany(() => OrderItem, (i) => i.order, { cascade: true })
  items!: OrderItem[];

  @Column({ type: 'text', nullable: true }) note?: string;
}
