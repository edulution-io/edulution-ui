import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SurveyAnswer = {
  surveyname: string;
  answer: string;
};

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
