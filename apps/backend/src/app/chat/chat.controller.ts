import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from '../users/users.service';
import { MailerService } from '../mailer/mailer.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chat: ChatService,
    private readonly users: UsersService,
    private readonly mailer: MailerService
  ) {}

  @Post('public')
  async publicMessage(
    @Body() body: { name?: string; email?: string; text?: string }
  ) {
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const text = (body.text || '').trim();
    if (!email || !text) return { ok: false, error: 'Missing email or text' };
    const { message } = await this.chat.publicSend(email, name || null, text);
    return message;
  }

  @Post('me/messages')
  @UseGuards(AuthGuard('jwt'))
  async meSend(@Req() req: any, @Body() body: { text?: string }) {
    const text = (body.text || '').trim();
    if (!text) return { ok: false, error: 'Empty' };
    const { message } = await this.chat.userSend(req.user.userId, text);
    return message;
  }

  @Get('me/messages')
  @UseGuards(AuthGuard('jwt'))
  async meList(@Req() req: any) {
    return this.chat.listForUser(req.user.userId);
  }

  @Get('conversations')
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  listConversations() {
    return this.chat.listConversations();
  }

  @Get('conversations/:id/messages')
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  listForAdmin(@Param('id') id: string) {
    return this.chat.listForAdmin(id);
  }

  @Post('conversations/:id/reply')
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  async adminReply(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { text?: string }
  ) {
    const text = (body.text || '').trim();
    if (!text) return { ok: false, error: 'Empty' };

    const { conversation, message } = await this.chat.adminReply(
      id,
      req.user.userId,
      text
    );

    const to = conversation.user?.email ?? conversation.contactEmail;
    if (to) {
      const name = conversation.user?.name ?? conversation.contactName ?? '';
      const subj = 'Réponse de Fileor';
      const plain = `Bonjour ${name},\n\n${text}\n\n— Fileor`;
      const html = `<p>Bonjour ${name},</p><p>${text.replace(
        /\n/g,
        '<br/>'
      )}</p><p>— Fileor</p>`;
      await this.mailer.send(to, subj, plain, html);
    }
    return message;
  }
}
