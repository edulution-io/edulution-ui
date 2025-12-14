import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import ChatService from './chat.service';
import AIService from './ai/ai.service';
import AIController from './ai/ai.controller';
import ChatController from './chat.controller';
import Chat, { ChatSchema } from './schemas/chat.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }])],
  controllers: [ChatController, AIController],
  providers: [ChatService, AIService],
  exports: [ChatService],
})
export default class ChatModule {}
