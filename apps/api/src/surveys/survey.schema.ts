import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Attendee } from '../../conferences/dto/attendee';
import Attendee from '@libs/survey/types/attendee';

export type SurveyDocument = SurveyModel & Document;

@Schema()
export class SurveyModel {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ type: JSON, required: true })
  formula: JSON;

  @Prop({ required: true })
  participants: Attendee[];

  @Prop({ type: Array<string>, required: false })
  participated?: string[];

  @Prop({ type: Array<JSON>, required: false })
  publicAnswers?: JSON[];

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
  canSubmitMultipleAnswers?: boolean;
}

const SurveySchema = SchemaFactory.createForClass(SurveyModel);

export default SurveySchema;
