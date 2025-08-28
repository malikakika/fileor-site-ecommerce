import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../app/users/user.entity';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const dataSource = app.get(DataSource);

    const repo = dataSource.getRepository(User);

    const email = (process.env.ADMIN_EMAIL || 'admin@fileor.local')
      .trim()
      .toLowerCase();
    const plain = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

    let admin = await repo.findOne({ where: { email } });

    if (admin) {
      console.log(' Admin already exists:', admin.email);
    } else {
      const hash = await bcrypt.hash(plain, 10);
      admin = repo.create({
        email,
        password: hash,
        name: 'Administrator',
        role: 'ADMIN',
      });
      await repo.save(admin);
      console.log(' Admin created:', admin.email);
    }
  } catch (e) {
    console.error('Seed failed:', e);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

run();
