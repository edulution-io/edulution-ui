import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import LdapGroups from '@libs/groups/types/ldapGroups';
import UserLanguage from '@libs/user/constants/userLanguage';
import UserLanguageType from '@libs/user/types/userLanguageType';
import UserAppearance from '@libs/user/constants/userAppearance';
import UserAppearanceType from '@libs/user/types/userAppearanceType';

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

  @Prop({ type: String, default: UserAppearance.SYSTEM })
  appearance: UserAppearanceType;
}

export const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
