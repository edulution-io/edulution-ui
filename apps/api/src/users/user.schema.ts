import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import UsersSurveys from '@libs/survey/types/users-surveys';
import emptyUsersSurveys from '@libs/survey/types/empty-user-surveys';

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

  @Prop()
  roles?: string[];

  @Prop({ type: Object, default: emptyUsersSurveys, required: false })
  usersSurveys?: UsersSurveys;
}

export const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
