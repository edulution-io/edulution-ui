import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import Attendee from '../conferences/attendee.schema';

export type SurveyAnswerDocument = SurveyAnswer & Document;

@Schema()
export class SurveyAnswer {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  surveyId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  saveNo: number;

  @Prop({ required: true })
  attendee: Attendee;

  @Prop({ type: JSON, required: true })
  answer: JSON;
}

const SurveyAnswerSchema = SchemaFactory.createForClass(SurveyAnswer);

export default SurveyAnswerSchema;
