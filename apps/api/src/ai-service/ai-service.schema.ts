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

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import AI_PROVIDERS from '@libs/aiService/constants/aiProviders';
import AI_SERVICE_PURPOSES from '@libs/aiService/constants/aiServicePurposes';

export type AiServiceDocument = AiService & Document;

@Schema({ timestamps: true, strict: true })
export class AiService {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: Object.values(AI_PROVIDERS) })
  provider: string;

  @Prop({ required: true })
  baseUrl: string;

  @Prop({ required: true })
  apiKey: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true, enum: Object.values(AI_SERVICE_PURPOSES) })
  purpose: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isDataPrivacyCompliant: boolean;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const AiServiceSchema = SchemaFactory.createForClass(AiService);

AiServiceSchema.set('toJSON', {
  virtuals: true,
});
