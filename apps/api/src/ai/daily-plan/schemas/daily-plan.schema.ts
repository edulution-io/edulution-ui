/*
 * LICENSE PLACEHOLDER
 */

import { z } from 'zod';

const ActionStepSchema = z.object({
  step_id: z.string(),
  capability: z.string(),
  description: z.string(),
  params: z.record(z.unknown()).optional(),
  depends_on: z.array(z.string()).optional(),
  optional: z.boolean().optional(),
});

const ActionProposalSchema = z.object({
  proposal_id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  steps: z.array(ActionStepSchema),
  requires_approval: z.literal(true).optional(),
  estimated_impact: z.enum(['low', 'medium', 'high']).optional(),
  reversible: z.enum(['full', 'partial', 'none']).optional(),
  risk: z.enum(['low', 'medium', 'high']).optional(),
});

const PriorityItemSchema = z.object({
  rank: z.coerce.number().min(1).max(6),
  title: z.string().min(1).max(100),
  why: z.string().min(1).max(300),
  linked_candidate_ids: z.array(z.string()).default([]),
  action_proposal: ActionProposalSchema.optional(),
});

const ScheduleItemSchema = z.object({
  time_window: z.enum(['morning', 'midday', 'afternoon', 'evening']),
  focus: z.string().min(1).max(100),
  items: z.array(z.string().max(150)).min(1).max(5),
});

const SafetyMetaSchema = z.object({
  no_new_facts: z.literal(true),
  numerals_allowed: z.literal(false),
  checked: z.literal(true),
});

const AiDailyPlanSchema = z.object({
  user_id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  plan_title: z.string().min(1).max(100),
  priorities: z.array(PriorityItemSchema).min(1).max(6),
  schedule_suggestion: z.array(ScheduleItemSchema).min(1).max(4),
  recap: z.string().min(1).max(500),
  notes: z.array(z.string().max(200)).max(5).default([]),
  safety: SafetyMetaSchema,
  generated_at: z.string(),
});

type AiDailyPlan = z.infer<typeof AiDailyPlanSchema>;
type PriorityItem = z.infer<typeof PriorityItemSchema>;
type ScheduleItem = z.infer<typeof ScheduleItemSchema>;
type ActionStep = z.infer<typeof ActionStepSchema>;
type ActionProposalItem = z.infer<typeof ActionProposalSchema>;

export {
  AiDailyPlanSchema,
  PriorityItemSchema,
  ScheduleItemSchema,
  SafetyMetaSchema,
  ActionStepSchema,
  ActionProposalSchema,
};

export type { AiDailyPlan, PriorityItem, ScheduleItem, ActionStep, ActionProposalItem };
