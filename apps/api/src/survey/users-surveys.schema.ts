import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Survey } from './survey.schema';

export type SurveyAnswer = {
  surveyname: string;
  answer: JSON;
};

export type UsersSurveysDocument = UsersSurveys & Document;

@Schema()
export class UsersSurveys {
  @Prop()
  username: string;

  @Prop()
  openSurveys: string[];

  @Prop()
  createdSurveys: Survey[];

  @Prop()
  answeredSurveys: SurveyAnswer[];
}

export const UsersSurveysSchema = SchemaFactory.createForClass(UsersSurveys);

export default UsersSurveysSchema;
