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

import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import { Survey } from './survey.schema';

export type SurveysTemplateDocument = SurveysTemplate & Document;

@Schema({ timestamps: true, strict: true })
export class SurveysTemplate {
  @Prop({ type: Object, required: true })
  template: Partial<Survey> & { formula: SurveyFormula };

  @Prop({ required: true })
  fileName: string;

  @Prop({ default: true, required: true })
  isActive: boolean;

  @Prop({ default: 1, required: true, unique: false })
  schemaVersion: number;
}

const SurveysTemplateSchema = SchemaFactory.createForClass(SurveysTemplate);

SurveysTemplateSchema.set('toJSON', {
  virtuals: true,
});

export default SurveysTemplateSchema;
