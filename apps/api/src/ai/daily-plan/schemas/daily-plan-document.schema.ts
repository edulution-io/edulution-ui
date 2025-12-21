/*
 * LICENSE PLACEHOLDER
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import type { AiDailyPlan } from './daily-plan.schema';
import type {
  InputsSnapshot,
  LlmMeta,
  GenerationMeta,
  SafetyResult,
} from './input-snapshot.schema';

export type DailyPlanDocumentType = DailyPlanDocument & Document & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, strict: true, collection: 'daily_plans' })
export class DailyPlanDocument {
  @Prop({ type: String, default: () => randomUUID(), unique: true, index: true })
  plan_id: string;

  @Prop({ required: true, index: true })
  user_id: string;

  @Prop({ required: true, index: true })
  date: string;

  @Prop({ required: true, index: true })
  input_hash: string;

  @Prop({ required: true })
  generated_at: Date;

  @Prop({ type: Object, required: true })
  generation_meta: GenerationMeta;

  @Prop({ type: Object })
  inputs_snapshot?: InputsSnapshot;

  @Prop({ type: Object })
  llm_meta?: LlmMeta;

  @Prop({ type: Object, required: true })
  safety: SafetyResult;

  @Prop({ required: true })
  used_fallback: boolean;

  @Prop({ type: Object, required: true })
  plan: AiDailyPlan;

  @Prop({ default: 0 })
  cache_hits: number;
}

export const DailyPlanDocumentSchema = SchemaFactory.createForClass(DailyPlanDocument);

DailyPlanDocumentSchema.index({ user_id: 1, date: 1, input_hash: 1 }, { unique: true, name: 'unique_plan_version' });
DailyPlanDocumentSchema.index({ user_id: 1, date: 1, createdAt: -1 }, { name: 'user_date_latest' });
DailyPlanDocumentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60, name: 'ttl_90_days' });
