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
import NotificationCategory from '@libs/notification/types/notificationCategory';
import NotificationType, { NotificationTypeValue } from '@libs/notification/types/notificationType';
import PUSH_NOTIFICATION_PRIORITY, {
  PushNotificationPriority,
} from '@libs/notification/constants/pushNotificationPriority';

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, index: true })
  recipientUsername: string;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationTypeValue;

  @Prop({ type: String, enum: NotificationCategory, default: undefined })
  category: NotificationTypeValue;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, maxlength: 150 })
  body: string;

  @Prop({ type: String, default: undefined })
  subtitle?: string;

  @Prop({ type: String, default: undefined })
  content?: string;

  @Prop({ type: Object, default: undefined })
  data?: Record<string, unknown>;

  @Prop({ type: String, default: undefined })
  sound?: string;

  @Prop({ type: Number, default: undefined })
  badge?: number;

  @Prop({ type: String, enum: typeof PUSH_NOTIFICATION_PRIORITY, default: undefined })
  priority?: PushNotificationPriority;

  @Prop({ type: String, default: undefined })
  categoryId?: string;
}

export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);
