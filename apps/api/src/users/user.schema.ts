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

import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import LdapGroups from '@libs/groups/types/ldapGroups';
import UserLanguage from '@libs/user/constants/userLanguage';
import UserLanguageType from '@libs/user/types/userLanguageType';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop()
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  password: string;

  @Prop()
  encryptKey: string;

  @Prop({ type: Object, default: {} })
  ldapGroups: LdapGroups;

  @Prop({ type: Boolean, default: false })
  mfaEnabled?: boolean;

  @Prop({ type: String, default: '' })
  totpSecret?: string;

  @Prop({ type: String, default: UserLanguage.SYSTEM })
  language: UserLanguageType;

  @Prop({
    type: [String],
    default: [],
    validate: {
      validator: (tokens: string[]) => new Set(tokens).size === tokens.length,
    },
  })
  registeredPushTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
