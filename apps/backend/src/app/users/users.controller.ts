import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@Req() req: any) {
    const u = await this.users.findOne(req.user.userId);
    const { id, email, name, role, createdAt, updatedAt } = u;
    return { id, email, name, role, createdAt, updatedAt };
  }

  @Patch('me')
  async updateMe(@Req() req: any, @Body() body: { name?: string }) {
    const updated = await this.users.update(req.user.userId, {
      name: body.name,
    });
    const { id, email, name, role, createdAt, updatedAt } = updated;
    return { id, email, name, role, createdAt, updatedAt };
  }

  @Get()
  async list(@Query('q') q?: string) {
    const list = await this.users.findAll();
    return list
      .filter((u) => (q ? u.email?.includes(q) || u.name?.includes(q) : true))
      .map(({ id, email, name, role, createdAt, updatedAt }) => ({
        id,
        email,
        name,
        role,
        createdAt,
        updatedAt,
      }));
  }
}
