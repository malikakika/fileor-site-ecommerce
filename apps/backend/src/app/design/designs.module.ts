import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Design } from './design.entity';
import { DesignsService } from './designs.service';
import { DesignsController } from './designs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Design])],
  providers: [DesignsService],
  controllers: [DesignsController],
})
export class DesignsModule {}
