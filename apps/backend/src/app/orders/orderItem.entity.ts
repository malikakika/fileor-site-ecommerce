import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(() => Order, (o) => o.items) order!: Order;
  @ManyToOne(() => Product) product!: Product;

  @Column('int') qty!: number;
  @Column('int') priceCents!: number;
}
