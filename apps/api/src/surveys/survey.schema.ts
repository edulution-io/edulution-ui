import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SurveyDocument = Survey & Document;

@Schema()
export class Survey {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  id: mongoose.Types.ObjectId;

  @Prop({ type: JSON, required: true })
  formula: JSON;

  @Prop({ required: false })
  saveNo?: number;

  @Prop({ type: Date, required: false })
  created?: Date;

  @Prop({ type: Date, required: false })
  expirationDate?: Date;

  @Prop({ required: false })
  expirationTime?: string;

  @Prop({ required: false })
  isAnonymous?: boolean;

  @Prop({ required: false })
  canUpdateFormerAnswer?: boolean;

  @Prop({ required: false })
  canSubmitMultipleAnswers?: boolean;
}

const SurveySchema = SchemaFactory.createForClass(Survey);

export default SurveySchema;
