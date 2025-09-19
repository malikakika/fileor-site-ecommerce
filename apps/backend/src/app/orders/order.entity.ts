import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
  Check,
} from 'typeorm';
import { User } from '../users/user.entity';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'STRIPE';
export type Currency = 'MAD' | 'EUR';

export type OrderItemJson = {
  id: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
};

@Entity()
@Index('idx_order_status', ['status'])
@Index('idx_order_created_at', ['createdAt'])
@Check(`"currency" IN ('MAD','EUR')`)
@Check(`"paymentMethod" IN ('COD','BANK_TRANSFER','STRIPE')`)
@Check(
  `"status" IN ('PENDING_PAYMENT','PAID','CONFIRMED','PROCESSING','DELIVERED','CANCELLED')`
)
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  user?: User | null;

  @Column({ type: 'text' })
  customerName!: string;

  @Column({ type: 'text', nullable: true })
  customerEmail?: string | null;

  @Column({ type: 'text' })
  customerPhone!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @Column({ type: 'text', default: 'COD' })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'text', default: 'PENDING_PAYMENT' })
  status!: OrderStatus;

  @Column({ type: 'jsonb' })
  items!: OrderItemJson[];

  @Column({ type: 'int', default: 0 })
  totalCents!: number;

  @Column({ type: 'text', default: 'MAD' })
  currency!: Currency;

  @CreateDateColumn()
  createdAt!: Date;
}
