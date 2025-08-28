import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DesignsService } from './designs.service';
import { Roles } from '../auth/roles.decorator';

@Controller('designs')
@UseGuards(AuthGuard('jwt'))
export class DesignsController {
  constructor(private readonly svc: DesignsService) {}

  @Post()
  create(
    @Req() req: any,
    @Body() body: { message?: string | null; imagePath: string; scene?: any }
  ) {
    return this.svc.create({
      userId: req.user.userId,
      message: body?.message ?? null,
      imagePath: body.imagePath,
      scene: body?.scene,
    });
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.svc.findAll();
  }

  @Get('me')
  findMine(@Req() req: any) {
    return this.svc.findMine(req.user.userId);
  }
}
