import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SurveyDocument = Survey & Document;

@Schema()
export class Survey {
  @Prop({ required: true })
  surveyname: string;

  @Prop({ type: JSON, required: true })
  survey: JSON;

  @Prop({ type: Array<string>, required: true })
  participants: string[];

  @Prop({ required: false })
  saveNo: string;

  @Prop({ required: false })
  created: string;

  @Prop({ required: false })
  isAnonymous: boolean;

  @Prop({ required: false })
  isAnswerChangeable: boolean;
}

export const SurveySchema = SchemaFactory.createForClass(Survey);

export default SurveySchema;
