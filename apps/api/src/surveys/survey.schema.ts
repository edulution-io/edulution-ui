import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Group } from '@libs/groups/types/group';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import Attendee from '../conferences/attendee.schema';

export type SurveyDocument = Survey & Document;

@Schema()
export class Survey {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  formula: TSurveyFormula;

  @Prop({ required: false })
  backendLimiters?: {
    questionId: string;
    choices: ChoiceDto[];
  }[];

  @Prop({ required: true })
  saveNo: number;

  @Prop({ required: true })
  creator: Attendee;

  @Prop({ required: true })
  invitedAttendees: Attendee[];

  @Prop({ required: true })
  invitedGroups: Group[];

  @Prop({ required: true })
  participatedAttendees: Attendee[];

  @Prop({ required: true })
  answers: mongoose.Types.ObjectId[];

  @Prop({ type: Date, required: true })
  created?: Date;

  @Prop({ type: Date, required: false })
  expires?: Date;

  @Prop({ required: false })
  isAnonymous?: boolean;

  @Prop({ required: false })
  isPublic?: boolean;

  @Prop({ required: false })
  canUpdateFormerAnswer?: boolean;

  @Prop({ required: false })
  canShowResultsTable?: boolean;

  @Prop({ required: false })
  canShowResultsChart?: boolean;

  @Prop({ required: false })
  canSubmitMultipleAnswers?: boolean;
}

const SurveySchema = SchemaFactory.createForClass(Survey);

export default SurveySchema;
