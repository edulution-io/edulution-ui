import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import ChatMessageRole from '@libs/chat/constants/chatMessageRole';

@Schema({ timestamps: true })
class ChatMessage {
  @Prop({ required: true })
  senderUsername: string;

  @Prop({ default: false })
  isAI?: boolean;

  @Prop({ required: true })
  content: string;

  @Prop({ type: String, required: true, enum: ChatMessageRole })
  role: string;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

export default ChatMessage;
