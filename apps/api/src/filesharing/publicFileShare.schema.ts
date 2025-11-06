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
import { v4 as uuidv4 } from 'uuid';
import DEFAULT_FILE_LINK_EXPIRY from '@libs/filesharing/constants/defaultFileLinkExpiry';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import Attendee from '../conferences/attendee.schema';

export type PublicShareDocument = PublicShare & Document & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

@Schema({ timestamps: true, strict: true })
export class PublicShare {
  @Prop({ type: String, default: uuidv4, unique: true, index: true })
  publicShareId: string;

  @Prop({ required: true })
  etag: string;

  @Prop({ required: true })
  share: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  creator: Attendee;

  @Prop({
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 },
    default: () => DEFAULT_FILE_LINK_EXPIRY,
  })
  expires: Date;

  @Prop()
  password?: string;

  @Prop({ type: [Object], required: true })
  invitedAttendees: AttendeeDto[];

  @Prop({ type: [Object], required: true })
  invitedGroups: MultipleSelectorGroup[];
}

export const PublicFileShareSchema = SchemaFactory.createForClass(PublicShare).set('toJSON', { virtuals: true });
