import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../products/product.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Cart, (c) => c.items, { onDelete: 'CASCADE' })
  cart!: Cart;

  @ManyToOne(() => Product, { eager: true, onDelete: 'RESTRICT' })
  product!: Product;

  @Column('int')
  quantity!: number;

  @Column('int')
  unitPriceCents!: number;

  @Column({ default: 'EUR' })
  currency!: string;
}
