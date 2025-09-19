import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';

type CreateOrderBody = {
  paymentMethod?: 'COD' | 'BANK_TRANSFER' | 'STRIPE';
  market?: 'MA' | 'FR';
  customer?: {
    fullName: string;
    email?: string;
    phone: string;
    address: string;
    city?: string;
    note?: string;
  };
  items: { id: string; name?: string; quantity: number; unitPrice: number }[];
};

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly svc: OrdersService) {}

  @Post()
  async create(@Req() req: any, @Body() body: CreateOrderBody) {
    const pm = body.paymentMethod ?? 'COD';
    const market = body.market ?? 'MA';
    const c = body.customer ?? ({} as NonNullable<CreateOrderBody['customer']>);

    const customerName = (c.fullName || '').trim();
    const customerEmail = (c.email || '').trim() || null;
    const customerPhone = (c.phone || '').trim();
    const address = [c.address, c.city].filter(Boolean).join(', ');

    const items = (body.items || []).map((it) => ({
      id: String(it.id),
      name: it.name ?? '',
      quantity: Math.max(1, Number(it.quantity || 1)),
      unitPrice: Number(it.unitPrice || 0), 
    }));

    return this.svc.create({
      userId: req?.user?.userId ?? null,
      paymentMethod: pm,
      market,
      customerName,
      customerEmail,
      customerPhone,
      address,
      note: c.note ?? null,
      items,
    });
  }
}
