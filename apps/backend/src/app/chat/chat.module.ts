import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UsersModule } from '../users/users.module';
import { MailerService } from '../mailer/mailer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message]), UsersModule],
  providers: [ChatService, MailerService],
  controllers: [ChatController],
})
export class ChatModule {}
