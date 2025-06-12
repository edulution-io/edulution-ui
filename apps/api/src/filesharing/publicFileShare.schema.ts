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
import { v4 as uuidv4 } from 'uuid';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import FILE_LINK_EXPIRY_VALUES from '@libs/filesharing/constants/fileLinkExpiryValues';
import AttendeeDto from '@libs/user/types/attendee.dto';

export type PublicFileShareDocument = PublicFileShare & Document & { _id: string };

@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  strict: true,
})
export class PublicFileShare {
  @Prop({ type: String, default: uuidv4 })
  _id!: string;

  @Prop({ required: true }) etag!: string;

  @Prop({ required: true }) filename!: string;

  @Prop({ required: true }) filePath!: string;

  @Prop({ required: true }) fileLink!: string;

  @Prop({ required: true }) publicFileLink!: string;

  @Prop({ required: true }) creator!: string;

  @Prop({
    type: String,
    enum: FILE_LINK_EXPIRY_VALUES,
    required: true,
  })
  expires!: (typeof FILE_LINK_EXPIRY_VALUES)[number];

  @Prop() password?: string;

  @Prop({ required: true, type: [Object] })
  invitedAttendees!: AttendeeDto[];

  @Prop({ required: true, type: [Object] })
  invitedGroups!: MultipleSelectorGroup[];

  @Prop({
    required: true,
    index: { expireAfterSeconds: 0 },
  })
  validUntil!: Date;
}

export const PublicFileShareSchema = SchemaFactory.createForClass(PublicFileShare).set('toJSON', { virtuals: true });

PublicFileShareSchema.virtual('id').get(function getId(this: PublicFileShareDocument) {
  const { _id: id } = this;
  return id;
});
