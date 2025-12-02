/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import AI_API_STANDARDS from '@libs/ai/constants/aiApiStandards';
import type { AiApiStandardType } from '@libs/ai/types/aiApiStandardType';
import type { AiConfigPurposeType } from '@libs/ai/types/aiConfigPurposeType';
import type AttendeeDto from '@libs/user/types/attendee.dto';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { Types } from 'mongoose';

@Schema({ _id: true })
export class AiConfig {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ default: '' })
  apiKey: string;

  @Prop({ required: true })
  aiModel: string;

  @Prop({ type: String, required: true, default: AI_API_STANDARDS.OPENAI })
  apiStandard: AiApiStandardType;

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
