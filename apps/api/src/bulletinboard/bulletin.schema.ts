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
import Attendee from '../conferences/attendee.schema';

export type BulletinDocument = Bulletin & Document;

@Schema({ timestamps: true, strict: true })
export class Bulletin {
  @Prop({ type: Object, required: true })
  creator: Attendee;

  @Prop({ type: Object })
  updatedBy?: Attendee;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Boolean, default: true, required: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'BulletinCategory', required: true })
  category: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  attachmentFileNames: string[];

  @Prop({ type: Date, required: false })
  isVisibleStartDate: Date | null;

  @Prop({ type: Date, required: false })
  isVisibleEndDate: Date | null;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const BulletinSchema = SchemaFactory.createForClass(Bulletin);

BulletinSchema.set('toJSON', {
  virtuals: true,
});
