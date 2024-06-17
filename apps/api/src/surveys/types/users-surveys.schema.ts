import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import SurveyAnswer from '@libs/survey/types/survey-answer';

export type UsersSurveysDocument = UsersSurveys & Document;

@Schema()
export class UsersSurveys {
  @Prop()
  openSurveys: number[];

  @Prop()
  createdSurveys: number[];

  @Prop()
  answeredSurveys: SurveyAnswer[];
}

export const UsersSurveysSchema = SchemaFactory.createForClass(UsersSurveys);

export default UsersSurveysSchema;
