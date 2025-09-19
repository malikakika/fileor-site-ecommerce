import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersAdminController {
  constructor(private readonly svc: OrdersService) {}

  @Get()
  @Roles('ADMIN')
  findAdmin(@Query('status') status?: string) {
    return this.svc.findForAdmin(status || 'PAID');
  }
}
