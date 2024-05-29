import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UsersSurveys } from '../polls-and-surveys/survey/types/users-surveys.schema';
import { UsersPolls } from '../polls-and-surveys/poll/types/users-polls.schema';

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

  @Prop()
  mfaEnabled?: boolean;

  @Prop()
  isTotpSet?: boolean;

  @Prop({ type: SchemaFactory.createForClass(UsersPolls) })
  usersPolls: {
    openPolls: string[];
    createdPolls: string[];
    answeredPolls: string[];
  };

  @Prop({ type: SchemaFactory.createForClass(UsersSurveys) })
  usersSurveys: {
    openSurveys: string[];
    createdSurveys: string[];
    answeredSurveys: {
      surveyname: string;
      answer: string;
    }[];
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
