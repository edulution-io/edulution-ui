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

import mongoose, { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';

export type UserAccountsDocument = UserAccounts & Document;

@Schema()
export class UserAccounts {
  @Prop({ type: mongoose.Schema.Types.ObjectId, index: true, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop()
  appName: string;

  @Prop()
  accountUser: string;

  @Prop()
  accountPassword: string;
}

export const UserAccountsSchema = SchemaFactory.createForClass(UserAccounts);

export default UserAccountsSchema;
