import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

import { Product } from './app/products/product.entity';
import { Category } from './app/categories/category.entity';
import { User } from './app/users/user.entity';
import { Order } from './app/orders/order.entity';
import { Favorite } from './app/favorites/favorite.entity';

config();

console.log('📡 DB CONFIG ->', {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'myecom',
});

export const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost', 
  port: parseInt(process.env.DB_PORT || '5433', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'myecom',
  entities: [Product, Category, User, Order,Favorite],
  synchronize: true,
  logging: true,
};
