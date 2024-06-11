import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SurveyAnswer } from './survey-answer';

export type UsersSurveysDocument = UsersSurveys & Document;

@Schema()
export class UsersSurveys {
  @Prop()
  openSurveys: string[];

  @Prop()
  createdSurveys: string[];

  @Prop()
  answeredSurveys: SurveyAnswer[];
}

export const UsersSurveysSchema = SchemaFactory.createForClass(UsersSurveys);

export default UsersSurveysSchema;
