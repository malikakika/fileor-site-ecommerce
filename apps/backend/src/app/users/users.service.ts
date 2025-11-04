import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from './user.entity';

type CreateUserInput = {
  email: string;
  password: string;
  name?: string;
  role?: Role;
  provider?: string;
  picture?: string;
};

type UpdateUserInput = Partial<
  Pick<User, 'email' | 'password' | 'name' | 'role'>
>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(input: CreateUserInput): Promise<User> {
    const email = input.email.trim().toLowerCase();
    const exists = await this.findByEmail(email);
    if (exists) throw new ConflictException('Email already in use');

    const user = this.repo.create({
      email,
      password: input.password,
      name: input.name?.trim(),
      role: input.role ?? 'CUSTOMER',
    });
    return this.repo.save(user);
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.findOne(id);
    if (input.email) input.email = input.email.trim().toLowerCase();
    Object.assign(user, input);
    return this.repo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.repo.remove(user);
  }
}
