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
import { Document, Types } from 'mongoose';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import type { AiConfigPurposeType } from '@libs/ai/types/aiConfigPurposeType';
import type AttendeeDto from '@libs/user/types/attendee.dto';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import type { AiProviderType } from '@libs/ai/types/aiProviderType';
import AiProvider from '@libs/ai/types/aiProvider';

export type AiConfigDocument = AiConfig & Document;

@Schema({ timestamps: true, collection: 'aiconfigs' })
class AiConfig implements Omit<AiConfigDto, 'id'> {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ default: '' })
  apiKey: string;

  @Prop({ required: true })
  aiModel: string;

  @Prop({ type: String, required: true, default: AiProvider.OpenAI })
  apiStandard: AiProviderType;

  @Prop({ type: [Object], default: [] })
  allowedUsers: AttendeeDto[];

  @Prop({ type: [Object], default: [] })
  allowedGroups: MultipleSelectorGroup[];

  @Prop({ type: [String], default: [] })
  purposes: AiConfigPurposeType[];
}

export const AiConfigSchema = SchemaFactory.createForClass(AiConfig);

AiConfigSchema.set('toJSON', { virtuals: true });
AiConfigSchema.set('toObject', { virtuals: true });

export default AiConfig;
