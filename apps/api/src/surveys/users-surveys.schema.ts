import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import SurveyAnswer from '@libs/survey/types/survey-answer';

export type UsersSurveysDocument = UsersSurveys & Document;

@Schema()
export class UsersSurveys {
  @Prop()
  openSurveys: mongoose.Types.ObjectId[];

  @Prop()
  createdSurveys: mongoose.Types.ObjectId[];

  @Prop()
  answeredSurveys: SurveyAnswer[];
}

const UsersSurveysSchema = SchemaFactory.createForClass(UsersSurveys);

export default UsersSurveysSchema;
