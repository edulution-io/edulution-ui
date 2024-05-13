import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SurveyDocument = Survey & Document;

@Schema()
export class Survey {
  @Prop()
  surveyname: string;

  @Prop({ required: true })
  participants: string[];

  @Prop({ required: true })
  survey: JSON;

  @Prop({ required: false })
  isAnonymous: boolean;

  @Prop({ required: false })
  isAnswerChangeable: boolean;
}

export const SurveySchema = SchemaFactory.createForClass(Survey);

export default SurveySchema;
