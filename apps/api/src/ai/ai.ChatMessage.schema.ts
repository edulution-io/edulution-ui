import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import AI_ROLES from '@libs/ai/constants/aiRoles';

@Schema({ _id: false })
export class AiChatMessage {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, enum: Object.values(AI_ROLES) })
  role: string;

  @Prop({ type: Array, required: true })
  parts: Array<{ type: string; text?: string }>;
}

export const AiChatMessageSchema = SchemaFactory.createForClass(AiChatMessage);
