import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column('int')
  priceCents!: number;

  @Column({ default: 'EUR' })
  currency!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('text', { array: true, default: '{}' })
  images!: string[];

  @ManyToOne(() => Category, (c) => c.products, { nullable: true, eager: true })
  category?: Category;
  
    @Column({ default: false })
  isBestSeller!: boolean;
}
