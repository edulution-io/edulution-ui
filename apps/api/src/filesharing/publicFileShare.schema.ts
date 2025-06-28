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

  @Prop({ required: true }) etag!: string;

  @Prop({ required: true }) filename!: string;

  @Prop({ required: true }) filePath!: string;

  @Prop({ required: true }) creator!: Attendee;

  @Prop({
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 },
    default: () => DEFAULT_FILE_LINK_EXPIRY,
  })
  expires: Date;

  @Prop() password?: string;

  @Prop({ type: [Object], required: true }) invitedAttendees: AttendeeDto[];

  @Prop({ type: [Object], required: true }) invitedGroups: MultipleSelectorGroup[];
}

export const PublicFileShareSchema = SchemaFactory.createForClass(PublicShare).set('toJSON', { virtuals: true });
