/*
 * LICENSE PLACEHOLDER
 */

import { z } from 'zod';

const SummarySnapshotSchema = z.object({
  activity_level: z.enum(['none', 'low', 'medium', 'high']),
  total_events: z.number().int().min(0),
  top_event_types: z.array(z.object({
    type: z.string(),
    count: z.number().int().min(0),
  })),
  communications: z.object({
    threads_awaiting_reply: z.number().int().min(0),
    messages_sent: z.number().int().min(0),
    messages_received: z.number().int().min(0),
  }).optional(),
  meetings: z.object({
    upcoming_24h: z.number().int().min(0),
    next_meeting_at: z.string().optional(),
  }).optional(),
});

const CandidateSnapshotSchema = z.object({
  candidate_id: z.string().min(1),
  class: z.string().min(1),
  title: z.string().min(1),
  score: z.number(),
  dedup_key: z.string().optional(),
  has_action_proposal: z.boolean(),
});

const InputsSnapshotSchema = z.object({
  summary: SummarySnapshotSchema,
  candidates: z.array(CandidateSnapshotSchema),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  requested_at: z.string(),
});

const LlmMetaSchema = z.object({
  model: z.string().min(1),
  prompt_version: z.string().min(1),
  prompt_hash: z.string().optional(),
  tokens_input: z.number().int().min(0).optional(),
  tokens_output: z.number().int().min(0).optional(),
  latency_ms: z.number().int().min(0),
  temperature: z.number().optional(),
});

const GenerationMetaSchema = z.object({
  service_version: z.string().min(1),
  git_sha: z.string().optional(),
  node_env: z.string().min(1),
});

const SafetyResultSchema = z.object({
  passed: z.boolean(),
  violations: z.array(z.string()).default([]),
  repaired: z.boolean().default(false),
});

type SummarySnapshot = z.infer<typeof SummarySnapshotSchema>;
type CandidateSnapshot = z.infer<typeof CandidateSnapshotSchema>;
type InputsSnapshot = z.infer<typeof InputsSnapshotSchema>;
type LlmMeta = z.infer<typeof LlmMetaSchema>;
type GenerationMeta = z.infer<typeof GenerationMetaSchema>;
type SafetyResult = z.infer<typeof SafetyResultSchema>;

export {
  SummarySnapshotSchema,
  CandidateSnapshotSchema,
  InputsSnapshotSchema,
  LlmMetaSchema,
  GenerationMetaSchema,
  SafetyResultSchema,
};

export type {
  SummarySnapshot,
  CandidateSnapshot,
  InputsSnapshot,
  LlmMeta,
  GenerationMeta,
  SafetyResult,
};
