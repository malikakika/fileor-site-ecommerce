import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import type { Request } from 'express';
import { User } from '../users/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly svc: FavoritesService) {}

  @Get()
  async getFavorites(@Req() req: Request) {
    const user = req.user as User;
    return this.svc.findAllByUser(user.id);
  }
@Post(':productId')
async addFavorite(@Param('productId') productId: string, @Req() req: Request) {
  const userId = (req.user as any).userId; 
  return this.svc.addFavorite({ id: userId } as User, productId);
}



  @Delete(':productId')
  async removeFavorite(@Param('productId') productId: string, @Req() req: Request) {
    const user = req.user as User;
    return this.svc.removeFavorite(user.id, productId);
  }
}
