import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './contact-message.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly repo: Repository<ContactMessage>
  ) {}

  async create(input: { name: string; email: string; message: string }) {
    const m = this.repo.create({ ...input, status: 'NEW' });
    return this.repo.save(m);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async markRead(id: string) {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Message not found');
    if (m.status === 'NEW') {
      m.status = 'READ';
      await this.repo.save(m);
    }
    return m;
  }

  async reply(id: string, replyText: string) {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Message not found');
    m.replyText = replyText;
    m.repliedAt = new Date();
    m.status = 'REPLIED';
    return this.repo.save(m);
  }
}
