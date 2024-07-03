import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import AttendeeDto from '@libs/conferences/types/attendee.dto';

export type SurveyDocument = Survey & Document;

@Schema()
export class Survey {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  id: mongoose.Types.ObjectId;

  @Prop({ type: JSON, required: true })
  formula: JSON;

  @Prop({ required: true })
  participants: AttendeeDto[];

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

const SurveySchema = SchemaFactory.createForClass(Survey);

export default SurveySchema;
