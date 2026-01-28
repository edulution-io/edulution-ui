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
import { NotificationType } from '@libs/notification/constants/notificationType';
import { NotificationSourceType } from '@libs/notification/constants/notificationSourceType';
import { PushNotificationPriority } from '@libs/notification/constants/pushNotificationPriority';
import { PushNotificationInterruptionLevel } from '@libs/notification/constants/pushNotificationInterruptionLevel';
import PUSH_NOTIFICATION_LIMITS from '@libs/notification/constants/pushNotificationLimits';
import { randomUUID } from 'crypto';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true, strict: true, collection: 'notifications' })
export class Notification {
  @Prop({ type: String, required: true, unique: true, default: randomUUID() })
  notificationId: string;

  @Prop({ type: String, required: true })
  type: NotificationType;

  @Prop({ type: String, required: false })
  sourceType?: NotificationSourceType;

  @Prop({ type: String, required: false })
  sourceId?: string;

  @Prop({ required: true, set: (v: string) => v.slice(0, PUSH_NOTIFICATION_LIMITS.TITLE_MAX_LENGTH) })
  title: string;

  @Prop({ required: true, set: (v: string) => v.slice(0, PUSH_NOTIFICATION_LIMITS.BODY_MAX_LENGTH) })
  pushNotification: string;

  @Prop({ required: false })
  content?: string;

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

  @Prop()
  createdAt: Date;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ notificationId: 1 }, { unique: true });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ sourceType: 1, sourceId: 1 });

NotificationSchema.set('toJSON', {
  virtuals: true,
});
