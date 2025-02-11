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

import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import Attendee from '../conferences/attendee.schema';

export type SurveyAnswerDocument = SurveyAnswer & Document;

@Schema()
export class SurveyAnswer {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  surveyId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  saveNo: number;

  @Prop({ required: true })
  attendee: Attendee;

  @Prop({ type: JSON, required: true })
  answer: JSON;
}

const SurveyAnswerSchema = SchemaFactory.createForClass(SurveyAnswer);

export default SurveyAnswerSchema;
