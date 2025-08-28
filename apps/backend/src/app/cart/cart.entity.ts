import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity()
@Unique(['userId', 'status'])
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status!: 'ACTIVE' | 'ORDERED' | 'CANCELLED';

  @OneToMany(() => CartItem, (i) => i.cart, { cascade: true })
  items!: CartItem[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
