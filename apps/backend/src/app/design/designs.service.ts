import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Design } from './design.entity';

@Injectable()
export class DesignsService {
  constructor(
    @InjectRepository(Design) private readonly repo: Repository<Design>
  ) {}

  create(input: {
    userId: string;
    message?: string | null;
    imagePath: string;
    scene?: any;
    exampleImage?: string | null;
  }) {
    const d = this.repo.create({
      message: input.message ?? null,
      imagePath: input.imagePath,
      scene: input.scene ?? null,
      exampleImage: input.exampleImage ?? null, 
      user: { id: input.userId } as any,
    });
    return this.repo.save(d);
  }
  findAll() {
    return this.repo
      .createQueryBuilder('d')
      .leftJoin('d.user', 'u')
      .addSelect(['u.id', 'u.email', 'u.name'])
      .orderBy('d.createdAt', 'DESC')
      .getMany();
  }

  findMine(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
