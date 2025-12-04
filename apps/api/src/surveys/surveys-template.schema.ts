/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import { Survey } from './survey.schema';

export type SurveysTemplateDocument = SurveysTemplate & Document;

@Schema({ timestamps: true, strict: true })
export class SurveysTemplate {
  @Prop({ required: true, unique: true })
  _id: Types.ObjectId;

  @Prop({ type: Object, required: true })
  template: Partial<Survey> & { formula: SurveyFormula };

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: true, required: true })
  isActive: boolean;

  @Prop({ default: false, required: true })
  isDefaultTemplate: boolean;

  @Prop({ default: 1, required: true, unique: false })
  schemaVersion: number;
}

const SurveysTemplateSchema = SchemaFactory.createForClass(SurveysTemplate);

SurveysTemplateSchema.set('toJSON', {
  virtuals: true,
});

export default SurveysTemplateSchema;
