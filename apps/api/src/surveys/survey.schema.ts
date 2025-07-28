/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Group } from '@libs/groups/types/group';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import Attendee from '../conferences/attendee.schema';

export type SurveyDocument = Survey & Document;

@Schema({ timestamps: true, strict: true })
export class Survey {
  @Prop({ required: true })
  formula: SurveyFormula;

  @Prop({ required: false })
  backendLimiters?: {
    questionName: string;
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
  expires: Date | null;

  @Prop({ required: false })
  isAnonymous?: boolean;

  @Prop({ required: false })
  isPublic?: boolean;

  @Prop({ required: false })
  canUpdateFormerAnswer?: boolean;

  @Prop({ required: false })
  canSubmitMultipleAnswers?: boolean;

  @Prop({ default: 1 })
  schemaVersion: number;
}

const SurveySchema = SchemaFactory.createForClass(Survey);

SurveySchema.set('toJSON', {
  virtuals: true,
});

export default SurveySchema;
