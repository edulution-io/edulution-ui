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
import NOTIFICATION_TYPE, { NotificationType } from '@libs/notification/constants/notificationType';
import NOTIFICATION_SOURCE_TYPE, { NotificationSourceType } from '@libs/notification/constants/notificationSourceType';
import PUSH_NOTIFICATION_PRIORITY, {
  PushNotificationPriority,
} from '@libs/notification/constants/pushNotificationPriority';
import {
  PUSH_NOTIFICATION_INTERRUPTION_LEVEL,
  PushNotificationInterruptionLevel,
} from '@libs/notification/constants/pushNotificationInterruptionLevel';
import THIRTY_DAYS from '@libs/common/constants/thirtyDays';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true, strict: true, collection: 'notifications' })
export class Notification {
  @Prop({ type: String, required: true, enum: Object.values(NOTIFICATION_TYPE), index: true })
  type: NotificationType;

  @Prop({ type: String, required: false, enum: Object.values(NOTIFICATION_SOURCE_TYPE), index: true })
  sourceType?: NotificationSourceType;

  @Prop({ type: String, required: false, index: true })
  sourceId?: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  pushNotification: string;

  @Prop({ type: String, required: false })
  content?: string;

  @Prop({ type: String, required: false, enum: Object.values(PUSH_NOTIFICATION_PRIORITY) })
  priority?: PushNotificationPriority;

  @Prop({ type: String, required: false, enum: Object.values(PUSH_NOTIFICATION_INTERRUPTION_LEVEL) })
  interruptionLevel?: PushNotificationInterruptionLevel;

  @Prop({ type: String, required: false })
  channelId?: string;

  @Prop({ type: Object, required: false })
  data?: Record<string, unknown>;

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop()
  createdAt: Date;

  @Prop({
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 },
    default: () => new Date(Date.now() + THIRTY_DAYS),
  })
  expiresAt: Date;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.set('toJSON', {
  virtuals: true,
});
