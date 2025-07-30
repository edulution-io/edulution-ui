/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
