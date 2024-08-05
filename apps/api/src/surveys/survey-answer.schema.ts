import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SurveyAnswerDocument = SurveyAnswer & Document;

@Schema()
export class SurveyAnswer {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  user: string;

  @Prop({ required: true })
  survey: mongoose.Types.ObjectId;

  @Prop({ type: JSON, required: true })
  answer: JSON;
}

const SurveyAnswerSchema = SchemaFactory.createForClass(SurveyAnswer);

export default SurveyAnswerSchema;
