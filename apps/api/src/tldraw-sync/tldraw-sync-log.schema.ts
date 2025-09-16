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
import { Document, Schema as MongooseSchema } from 'mongoose';
import Attendee from '../conferences/attendee.schema';

@Schema({ timestamps: true, strict: true })
export class TLDrawSyncLog {
  @Prop({ required: true })
  roomId: string;

  @Prop({ required: true })
  attendee: Attendee;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  message: Record<string, unknown>;
}

export type TLDrawSyncLogDocument = TLDrawSyncLog & Document;
export const TLDrawSyncLogSchema = SchemaFactory.createForClass(TLDrawSyncLog);

TLDrawSyncLogSchema.set('toJSON', {
  virtuals: true,
});
