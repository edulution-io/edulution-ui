import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import ChatType from '@libs/chat/types/chatType';
import ChatParticipant, { ChatParticipantSchema } from './chat-participant.schema';
import ChatMessage, { ChatMessageSchema } from './chat-message.schema';

@Schema({ timestamps: true })
class Chat {
  _id: Types.ObjectId;

  @Prop({ required: true, enum: Object.values(ChatType) })
  type: string;

  @Prop()
  title?: string;

  @Prop({ type: [ChatParticipantSchema], default: [] })
  participants: ChatParticipant[];

  @Prop()
  groupCn?: string;

  @Prop()
  groupName?: string;

  @Prop({ required: true })
  ownerUsername: string;

  @Prop({ type: [ChatMessageSchema], default: [] })
  messages: ChatMessage[];

  @Prop()
  aiProvider?: string;

  @Prop()
  aiModel?: string;

  createdAt: Date;

  updatedAt: Date;
}

export type ChatDocument = Chat & Document;

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.index({ ownerUsername: 1, type: 1 });
ChatSchema.index({ 'participants.username': 1 });
ChatSchema.index({ groupCn: 1 });
ChatSchema.index({ updatedAt: -1 });

export default Chat;
