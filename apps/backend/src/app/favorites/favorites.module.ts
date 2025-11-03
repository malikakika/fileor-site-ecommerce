import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';

import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Product, User])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
