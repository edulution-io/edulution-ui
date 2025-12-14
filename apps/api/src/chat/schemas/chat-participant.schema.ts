import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
class ChatParticipant {
  @Prop({ required: true })
  username: string;

  @Prop()
  displayName?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ default: false })
  isAI?: boolean;
}

export const ChatParticipantSchema = SchemaFactory.createForClass(ChatParticipant);

export default ChatParticipant;
