import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UsersSurveys } from '../surveys/types/users-surveys.schema';

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

  @Prop({ type: SchemaFactory.createForClass(UsersSurveys), required: false })
  usersSurveys?: {
    openSurveys?: number[];
    createdSurveys?: number[];
    answeredSurveys?: {
      surveyId: number;
      answer?: JSON;
    }[];
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
