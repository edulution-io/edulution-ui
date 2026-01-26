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

import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MessageSourceType } from '@libs/notification/constants/messageSourceType';
import { PushNotificationPriority } from '@libs/notification/constants/pushNotificationPriority';
import { PushNotificationInterruptionLevel } from '@libs/notification/constants/pushNotificationInterruptionLevel';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true, strict: true })
export class Message {
  @Prop({ type: String, required: true })
  sourceType: MessageSourceType;

  @Prop({ type: String, required: true })
  sourceId: string;

  @Prop({ required: true, maxlength: 50 })
  title: string;

  @Prop({ required: true, maxlength: 150 })
  summary: string;

  @Prop({ required: false })
  body?: string;

  @Prop({ type: String, required: false })
  priority?: PushNotificationPriority;

  @Prop({ type: String, required: false })
  interruptionLevel?: PushNotificationInterruptionLevel;

  @Prop({ required: false })
  channelId?: string;

  @Prop({ type: Object, required: false })
  data?: Record<string, unknown>;

  @Prop({ required: true })
  createdBy: string;

  createdAt: Date;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ sourceType: 1, sourceId: 1 });

MessageSchema.set('toJSON', {
  virtuals: true,
});
