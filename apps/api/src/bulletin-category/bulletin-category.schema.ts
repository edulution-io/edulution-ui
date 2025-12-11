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
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import BULLETIN_VISIBILITY_STATES from '@libs/bulletinBoard/constants/bulletinVisibilityStates';
import BulletinVisibilityStatesType from '@libs/bulletinBoard/types/bulletinVisibilityStatesType';
import Attendee from '../conferences/attendee.schema';

export type BulletinCategoryDocument = BulletinCategory & Document;

@Schema({ timestamps: true, strict: true })
export class BulletinCategory {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Array, default: [] })
  visibleForUsers: MultipleSelectorGroup[];

  @Prop({ type: Array, default: [] })
  visibleForGroups: MultipleSelectorGroup[];

  @Prop({ type: Array, default: [] })
  editableByUsers: MultipleSelectorGroup[];

  @Prop({ type: Array, default: [] })
  editableByGroups: MultipleSelectorGroup[];

  @Prop({ type: Object, required: true })
  creator: Attendee;

  @Prop({ type: Number, required: true })
  position: number;

  @Prop({
    type: String,
    enum: Object.values(BULLETIN_VISIBILITY_STATES),
    default: BULLETIN_VISIBILITY_STATES.FULLY_VISIBLE,
  })
  bulletinVisibility: BulletinVisibilityStatesType;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const BulletinCategorySchema = SchemaFactory.createForClass(BulletinCategory);

BulletinCategorySchema.set('toJSON', {
  virtuals: true,
});
