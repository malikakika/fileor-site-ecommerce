import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation) private convRepo: Repository<Conversation>,
    @InjectRepository(Message) private msgRepo: Repository<Message>
  ) {}

  async getOrCreateConversationForUser(userId: string) {
    let conv = await this.convRepo.findOne({
      where: { user: { id: userId }, status: 'OPEN' },
    });
    if (!conv) {
      conv = this.convRepo.create({
        user: { id: userId } as any,
        status: 'OPEN',
      });
      conv = await this.convRepo.save(conv);
    }
    return conv;
  }

  async getOrCreateConversationForGuest(email: string, name?: string | null) {
    let conv = await this.convRepo.findOne({
      where: { contactEmail: email, status: 'OPEN' },
    });
    if (!conv) {
      conv = this.convRepo.create({
        contactEmail: email,
        contactName: name ?? null,
        status: 'OPEN',
      });
      conv = await this.convRepo.save(conv);
    } else {
      // garder le dernier nom si fourni
      if (name && !conv.contactName) {
        conv.contactName = name;
        await this.convRepo.save(conv);
      }
    }
    return conv;
  }

  async userSend(userId: string, body: string) {
    const conv = await this.getOrCreateConversationForUser(userId);
    const msg = this.msgRepo.create({
      conversation: { id: conv.id } as any,
      author: { id: userId } as any,
      direction: 'USER',
      body,
      readByAdmin: false,
      readByUser: true,
    });
    await this.msgRepo.save(msg);
    return { conversationId: conv.id, message: msg };
  }

  async publicSend(email: string, name: string | null, body: string) {
    const conv = await this.getOrCreateConversationForGuest(
      email.trim().toLowerCase(),
      name?.trim() || null
    );
    const msg = this.msgRepo.create({
      conversation: { id: conv.id } as any,
      author: null,
      direction: 'USER',
      body,
      readByAdmin: false,
      readByUser: true,
    });
    await this.msgRepo.save(msg);
    return { conversationId: conv.id, message: msg };
  }

  async adminReply(convId: string, adminId: string, body: string) {
    const conv = await this.convRepo.findOne({ where: { id: convId } });
    if (!conv) throw new NotFoundException('Conversation not found');

    const msg = this.msgRepo.create({
      conversation: { id: conv.id } as any,
      author: { id: adminId } as any,
      direction: 'ADMIN',
      body,
      readByAdmin: true,
      readByUser: false,
    });
    await this.msgRepo.save(msg);
    return { conversation: conv, message: msg };
  }

  listForUser(userId: string) {
    return this.msgRepo
      .createQueryBuilder('m')
      .leftJoin('m.conversation', 'c')
      .where('c.userId = :userId', { userId })
      .orderBy('m.createdAt', 'ASC')
      .getMany();
  }

  listForAdmin(convId: string) {
    return this.msgRepo.find({
      where: { conversation: { id: convId } },
      order: { createdAt: 'ASC' },
    });
  }

  listConversations() {
    return this.convRepo.find({ order: { updatedAt: 'DESC' } });
  }
}
