import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  getMyCart(@Req() req: any) {
    return this.service.getMyCart(req.user.userId);
  }

  @Post('items')
  addItem(@Req() req: any, @Body() body: AddItemDto) {
    return this.service.addItem(req.user.userId, body.productId, body.quantity);
  }

  @Patch('items/:itemId')
  updateItem(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() body: UpdateItemDto
  ) {
    return this.service.updateItem(req.user.userId, itemId, body.quantity);
  }

  @Delete('items/:itemId')
  removeItem(@Req() req: any, @Param('itemId') itemId: string) {
    return this.service.removeItem(req.user.userId, itemId);
  }

  @Delete()
  clear(@Req() req: any) {
    return this.service.clear(req.user.userId);
  }
}
