import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { StorageModule } from './storage/storage.module';
import { DesignsModule } from './design/designs.module';
import { ContactModule } from './contact/contact.module';
import { ChatModule } from './chat/chat.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        url: cfg.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),
    }),

    ProductsModule,
    UsersModule,
    AuthModule,
    CartModule,
    StorageModule,
    DesignsModule,
    ContactModule,
    ChatModule,
    OrdersModule
    
  ],
})
export class AppModule {}
