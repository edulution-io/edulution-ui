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
