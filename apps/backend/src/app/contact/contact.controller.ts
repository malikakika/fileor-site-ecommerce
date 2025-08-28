import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { ContactService } from './contact.service';

@Controller()
export class ContactController {
  constructor(private readonly svc: ContactService) {}

  @Post('contact')
  async create(
    @Body() body: { name?: string; email?: string; message?: string }
  ) {
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const message = (body.message || '').trim();
    if (!name || !email || !message) throw new Error('Missing fields');
    await this.svc.create({ name, email, message });
    return { ok: true };
  }

  @Get('admin/contact-messages')
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  async list() {
    return this.svc.findAll();
  }

  @Patch('admin/contact-messages/:id/read')
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  markRead(@Param('id') id: string) {
    return this.svc.markRead(id);
  }

  @Post('admin/contact-messages/:id/reply')
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  reply(@Param('id') id: string, @Body() body: { replyText?: string }) {
    return this.svc.reply(id, (body.replyText || '').trim());
  }
}
