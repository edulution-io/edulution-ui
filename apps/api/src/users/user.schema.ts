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
