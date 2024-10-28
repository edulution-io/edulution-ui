import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import LdapGroups from '@libs/groups/types/ldapGroups';
import UserLanguage from '@libs/user/constants/userLanguage';

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

  @Prop({ type: String, default: UserLanguage.SYSTEM_LANGUAGE })
  language: (typeof UserLanguage)[keyof typeof UserLanguage];
}

export const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
