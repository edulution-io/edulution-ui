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
import TSurveyAnswer from '@libs/survey/types/TSurveyAnswer';
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

  @Prop({ type: Object, required: true })
  answer: TSurveyAnswer;

  @Prop({ default: 1 })
  schemaVersion: number;
}

const SurveyAnswersSchema = SchemaFactory.createForClass(SurveyAnswer);

SurveyAnswersSchema.set('toJSON', {
  virtuals: true,
});

export default SurveyAnswersSchema;
