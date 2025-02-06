import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Group } from '@libs/groups/types/group';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import Attendee from '../conferences/attendee.schema';

export type SurveyDocument = Survey & Document;

@Schema({ timestamps: true, strict: true })
export class Survey {
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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'SurveyAnswer' }], required: true })
  answers: Types.ObjectId[];

  @Prop({ type: Date, required: false })
  expires?: Date;

  @Prop({ required: false })
  isAnonymous?: boolean;

  @Prop({ required: false })
  isPublic?: boolean;

  @Prop({ required: false })
  canUpdateFormerAnswer?: boolean;

  @Prop({ required: false })
  canSubmitMultipleAnswers?: boolean;
}

const SurveySchema = SchemaFactory.createForClass(Survey);

SurveySchema.set('toJSON', {
  virtuals: true,
});

export default SurveySchema;
