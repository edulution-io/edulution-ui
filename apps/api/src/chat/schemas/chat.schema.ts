/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

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
