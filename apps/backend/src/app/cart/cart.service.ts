import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly carts: Repository<Cart>,
    @InjectRepository(CartItem) private readonly items: Repository<CartItem>,
    @InjectRepository(Product) private readonly products: Repository<Product>
  ) {}

  async ensureActiveCart(userId: string): Promise<Cart> {
    let cart = await this.carts.findOne({
      where: { userId, status: 'ACTIVE' },
      relations: ['items', 'items.product'],
    });
    if (!cart) {
      cart = this.carts.create({ userId, status: 'ACTIVE', items: [] });
      cart = await this.carts.save(cart);
      cart.items = [];
    }
    return cart;
  }

  async getMyCart(userId: string) {
    const cart = await this.ensureActiveCart(userId);
    const totalCents = cart.items.reduce(
      (sum, i) => sum + i.unitPriceCents * i.quantity,
      0
    );
    return {
      id: cart.id,
      items: cart.items.map((i) => ({
        id: i.id,
        product: {
          id: i.product.id,
          title: i.product.title,
          slug: i.product.slug,
          images: i.product.images,
        },
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
        currency: i.currency,
        lineTotalCents: i.unitPriceCents * i.quantity,
      })),
      totalCents,
      currency: cart.items[0]?.currency ?? 'EUR',
      updatedAt: cart.updatedAt,
    };
  }

  async addItem(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) throw new BadRequestException('Quantity must be > 0');

    const product = await this.products.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const cart = await this.ensureActiveCart(userId);

    // Si l’article existe déjà dans le panier => on incrémente
    const existing = cart.items.find((i) => i.product.id === productId);
    if (existing) {
      existing.quantity += quantity;
      await this.items.save(existing);
    } else {
      const item = this.items.create({
        cart,
        product,
        quantity,
        unitPriceCents: product.priceCents,
        currency: product.currency,
      });
      await this.items.save(item);
    }

    return this.getMyCart(userId);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) throw new BadRequestException('Quantity must be > 0');

    const cart = await this.ensureActiveCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Item not found');

    item.quantity = quantity;
    await this.items.save(item);
    return this.getMyCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.ensureActiveCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return this.getMyCart(userId);
    await this.items.remove(item);
    return this.getMyCart(userId);
  }

  async clear(userId: string) {
    const cart = await this.ensureActiveCart(userId);
    if (cart.items.length) {
      await this.items.remove(cart.items);
    }
    return this.getMyCart(userId);
  }
}
