import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import Attendee from '../conferences/attendee.schema';

export type SurveyAnswerDocument = SurveyAnswer & Document;

@Schema({ timestamps: true, strict: true })
export class SurveyAnswer {
  @Prop({ type: Types.ObjectId, ref: 'Survey', required: true })
  surveyId: Types.ObjectId;

  @Prop({ required: true })
  saveNo: number;

  @Prop({ required: true })
  attendee: Attendee;

  @Prop({ type: JSON, required: true })
  answer: JSON;
}

const SurveyAnswerSchema = SchemaFactory.createForClass(SurveyAnswer);

SurveyAnswerSchema.set('toJSON', {
  virtuals: true,
});

export default SurveyAnswerSchema;
