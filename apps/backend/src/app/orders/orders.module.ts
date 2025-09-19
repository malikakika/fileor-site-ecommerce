import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersAdminController } from './orders.admin.controller';
import { Product } from '../products/product.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product])], 
  providers: [OrdersService],
  controllers: [OrdersController, OrdersAdminController],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}
