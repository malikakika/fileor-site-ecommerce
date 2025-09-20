import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
app.enableCors({ 
  origin: [
    'http://localhost:4200',
    'https://fileor.roadshine.ma'
  ],
  credentials: true 
});
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ? +process.env.PORT : 3333);
  console.log(`🚀 API: http://localhost:${process.env.PORT ?? 3333}/api`);
}
bootstrap();
