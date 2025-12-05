import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AiChatMessage, AiChatMessageSchema } from './ai.ChatMessage.schema';

@Schema({ timestamps: true, collection: 'chathistories' })
export class AiChatHistory extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: [AiChatMessageSchema], default: [] })
  messages: AiChatMessage[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AiChatHistorySchema = SchemaFactory.createForClass(AiChatHistory);
