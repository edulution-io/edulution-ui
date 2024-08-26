import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import LdapGroups from '@libs/groups/types/ldapGroups';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop()
  email?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  password?: string;

  @Prop({ type: Object, default: {} })
  ldapGroups?: LdapGroups;
}

export const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
