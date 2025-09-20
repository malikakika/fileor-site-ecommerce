import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';

type IncomingItem = { id: string; quantity: number };

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,

    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}


  private priceCentsOf(p: any): number {
    if (p?.priceCents != null) return Math.round(Number(p.priceCents)) | 0;
    if (p?.price_cents != null) return Math.round(Number(p.price_cents)) | 0;

    if (p?.price != null) {
      const n = Number(p.price);
      if (Number.isFinite(n)) return Math.round(n * 100);
      const s = String(p.price).replace(',', '.');
      const f = parseFloat(s);
      if (Number.isFinite(f)) return Math.round(f * 100);
    }
    return 0;
  }

 
  async create(input: {
    userId?: string | null;
    paymentMethod: 'COD' | 'BANK_TRANSFER' | 'STRIPE';
    market?: 'MA' | 'FR';
    customerName: string;
    customerEmail: string | null;
    customerPhone: string;
    address: string;
    note?: string | null;
    items: IncomingItem[];
  }) {
    if (!input.items?.length) {
      throw new BadRequestException('No items provided');
    }

    const ids = input.items.map((it) => String(it.id));
    const products = await this.productsRepo.find({
      where: { id: In(ids) as any },
    });
    const byId = new Map(products.map((p) => [String(p.id), p]));

    const missing = ids.filter((id) => !byId.has(id));

    const keptItems = input.items.filter((it) => byId.has(String(it.id)));
    if (!keptItems.length) {
      throw new BadRequestException(
        `Unknown product ids: ${missing.join(', ')}`
      );
    }

    const lines = keptItems.map((it) => {
      const prod = byId.get(String(it.id))!;
      const qty = Math.max(1, Number(it.quantity || 1));
      const unitPriceCents = this.priceCentsOf(prod);

      return {
        id: String(prod.id),
        name: String((prod as any).title ?? (prod as any).name ?? ''),
        quantity: qty,
        unitPriceCents,
        subtotalCents: unitPriceCents * qty,
      };
    });

    const totalCents = lines.reduce((sum, l) => sum + l.subtotalCents, 0);
    const currency: 'MAD' | 'EUR' = input.market === 'FR' ? 'EUR' : 'MAD';

    const order = this.ordersRepo.create({
      user: input.userId ? ({ id: input.userId } as any) : null,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      address: input.address,
      paymentMethod: input.paymentMethod,
      status: input.paymentMethod === 'COD' ? 'PENDING_PAYMENT' : 'PAID',
      items: lines,
      totalCents,
      currency,

    });

    if (missing.length) {
      console.warn('Order created after filtering unknown product ids:', missing);
    }

    return this.ordersRepo.save(order);
  }

  async findForAdmin(status?: string) {
    const DEFAULT = ['PENDING_PAYMENT', 'PAID', 'CONFIRMED', 'DELIVERED'] as const;
    const statuses = status && status !== 'ALL' ? [status] : (DEFAULT as any);

    return this.ordersRepo.find({
      where: { status: In(statuses) as any },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async findMine(userId: string) {
    return this.ordersRepo.find({
      where: { user: { id: userId } as any },
      order: { createdAt: 'DESC' },
    });
  }
}
