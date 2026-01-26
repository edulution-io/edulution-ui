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

import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import USER_MESSAGE_STATUS, { UserMessageStatus } from '@libs/notification/constants/userMessageStatus';

export type UserMessageDocument = UserMessage & Document;

@Schema({ timestamps: true, strict: true })
export class UserMessage {
  @Prop({ type: Types.ObjectId, ref: 'Message', required: true })
  messageId: Types.ObjectId;

  @Prop({ required: true })
  recipient: string;

  @Prop({ type: Date, default: null })
  readAt: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: String, required: true, default: USER_MESSAGE_STATUS.PENDING })
  status: UserMessageStatus;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const UserMessageSchema = SchemaFactory.createForClass(UserMessage);

UserMessageSchema.index({ recipient: 1, createdAt: -1 });
UserMessageSchema.index({ recipient: 1, readAt: 1 });
UserMessageSchema.index({ messageId: 1 });

UserMessageSchema.set('toJSON', {
  virtuals: true,
});
