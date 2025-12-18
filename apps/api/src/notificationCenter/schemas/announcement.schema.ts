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
import { Document } from 'mongoose';
import ANNOUNCEMENT_STATUS from '@libs/notification-center/constants/announcementStatus';
import CHANNELS from '@libs/notification-center/constants/channels';
import type { ChannelsType } from '@libs/notification-center/types/channelsType';
import type { AnnouncementStatusType } from '@libs/notification-center/types/announcementStatusType';
import type AttendeeDto from '@libs/user/types/attendee.dto';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

@Schema({ timestamps: true })
export class Announcement extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  pushMessage: string;

  @Prop()
  extendedMessage?: string;

  @Prop({ type: [String], enum: Object.values(CHANNELS), default: [] })
  channels: ChannelsType;

  @Prop({ type: [Object], default: [] })
  recipientGroups: MultipleSelectorGroup[];

  @Prop({ type: [Object], default: [] })
  recipientUsers: AttendeeDto[];

  @Prop({ type: Number, default: 0 })
  recipientsCount: number;

  @Prop({ type: Object, required: true })
  creator: {
    firstName: string;
    lastName: string;
    username: string;
  };

  @Prop({
    type: String,
    enum: Object.values(ANNOUNCEMENT_STATUS),
    default: undefined,
  })
  status: AnnouncementStatusType;

  @Prop()
  scheduledAt?: Date;

  @Prop()
  sentAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);

AnnouncementSchema.set('toJSON', {
  virtuals: true,
});

AnnouncementSchema.index({ status: 1, scheduledAt: 1 });
AnnouncementSchema.index({ createdAt: -1 });
AnnouncementSchema.index({ 'creator.username': 1 });
