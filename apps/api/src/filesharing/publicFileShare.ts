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

export type PublicShareDocument = PublicFileShare & Document;

@Schema({ timestamps: true, strict: true })
export class PublicFileShare {
  @Prop({ required: true })
  sharedFileId: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: false })
  validUntil: Date;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: false })
  fileLink?: string;
}

export const PublicFileShareSchema = SchemaFactory.createForClass(PublicFileShare);

PublicFileShareSchema.set('toJSON', {
  virtuals: true,
});
