import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UsersSurveys } from '../survey/users-surveys.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ required: true })
  roles: string[];

  @Prop({ required: false })
  UsersSurveys: UsersSurveys;
}

export const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
