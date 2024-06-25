import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import UsersSurveysSchema from '../surveys/users-surveys.schema';

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

  @Prop({ type: UsersSurveysSchema, required: false })
  usersSurveys?: {
    openSurveys?: mongoose.Types.ObjectId[];
    createdSurveys?: mongoose.Types.ObjectId[];
    answeredSurveys?: {
      surveyId: mongoose.Types.ObjectId;
      answer?: JSON;
    }[];
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
