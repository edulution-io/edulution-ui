/*
 * LICENSE PLACEHOLDER
 */

import { z } from 'zod';

const ExplainabilityEvidenceKindSchema = z.enum([
  'state',
  'event',
  'correlation',
  'rule',
  'heuristic',
]);

type ExplainabilityEvidenceKind = z.infer<typeof ExplainabilityEvidenceKindSchema>;

const ExplainabilityRefTypeSchema = z.enum([
  'event_id',
  'object_id',
  'object_ref',
  'redis_key',
  'correlation_id',
  'rule_id',
  'context_id',
]);

type ExplainabilityRefType = z.infer<typeof ExplainabilityRefTypeSchema>;

const ExplainabilityTimeWindowSchema = z.enum([
  '1h',
  '24h',
  '7d',
  'today',
  'custom',
]);

type ExplainabilityTimeWindow = z.infer<typeof ExplainabilityTimeWindowSchema>;

const ExplainabilitySensitivitySchema = z.enum([
  'low',
  'medium',
  'high',
]);

type ExplainabilitySensitivity = z.infer<typeof ExplainabilitySensitivitySchema>;

const ExplainabilityRefSchema = z.object({
  ref_type: ExplainabilityRefTypeSchema,
  ref: z.string().min(1),
  source: z.string().optional(),
  time_window: ExplainabilityTimeWindowSchema.optional(),
  occurred_at: z.string().datetime().optional(),
  received_at: z.string().datetime().optional(),
});

type ExplainabilityRef = z.infer<typeof ExplainabilityRefSchema>;

const FORBIDDEN_META_FIELDS = ['body', 'subject', 'content', 'message', 'text'];

const ExplainabilityMetaSchema = z
  .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
  .refine(
    (meta) =>
      !Object.keys(meta).some((key) =>
        FORBIDDEN_META_FIELDS.some((f) => key.toLowerCase().includes(f)),
      ),
    { message: 'Meta contains forbidden sensitive fields' },
  );

type ExplainabilityMeta = z.infer<typeof ExplainabilityMetaSchema>;

const ExplainabilityEvidenceSchema = z.object({
  kind: ExplainabilityEvidenceKindSchema,
  label: z.string().min(1).max(100),
  refs: z.array(ExplainabilityRefSchema).min(1),
  meta: ExplainabilityMetaSchema.default({}),
  sensitivity: ExplainabilitySensitivitySchema.default('low'),
});

type ExplainabilityEvidence = z.infer<typeof ExplainabilityEvidenceSchema>;

const ExplainabilitySchema = z.object({
  rule_id: z.string().min(1),
  rule_version: z.string().regex(/^\d+\.\d+\.\d+$/),
  summary: z.string().min(1).max(200),
  evidence: z.array(ExplainabilityEvidenceSchema).min(1),
});

type Explainability = z.infer<typeof ExplainabilitySchema>;

function createStateEvidence(
  label: string,
  redisKey: string,
  source?: string,
  timeWindow?: ExplainabilityTimeWindow,
  meta: ExplainabilityMeta = {},
): ExplainabilityEvidence {
  return {
    kind: 'state',
    label,
    refs: [
      {
        ref_type: 'redis_key',
        ref: redisKey,
        source,
        time_window: timeWindow,
      },
    ],
    meta,
    sensitivity: 'low',
  };
}

function createCorrelationEvidence(
  label: string,
  correlationId: string,
  meta: ExplainabilityMeta = {},
): ExplainabilityEvidence {
  return {
    kind: 'correlation',
    label,
    refs: [
      {
        ref_type: 'correlation_id',
        ref: correlationId,
      },
    ],
    meta,
    sensitivity: 'low',
  };
}

function createRuleEvidence(ruleId: string): ExplainabilityEvidence {
  return {
    kind: 'rule',
    label: 'Rule triggered',
    refs: [
      {
        ref_type: 'rule_id',
        ref: ruleId,
      },
    ],
    meta: {},
    sensitivity: 'low',
  };
}

function createEventEvidence(
  label: string,
  eventId: string,
  source: string,
  occurredAt?: string,
  meta: ExplainabilityMeta = {},
): ExplainabilityEvidence {
  return {
    kind: 'event',
    label,
    refs: [
      {
        ref_type: 'event_id',
        ref: eventId,
        source,
        occurred_at: occurredAt,
      },
    ],
    meta,
    sensitivity: 'medium',
  };
}

function createHeuristicEvidence(
  label: string,
  refs: ExplainabilityRef[],
  meta: ExplainabilityMeta = {},
): ExplainabilityEvidence {
  return {
    kind: 'heuristic',
    label,
    refs,
    meta,
    sensitivity: 'low',
  };
}

export {
  ExplainabilityEvidenceKindSchema,
  ExplainabilityRefTypeSchema,
  ExplainabilityTimeWindowSchema,
  ExplainabilitySensitivitySchema,
  ExplainabilityRefSchema,
  ExplainabilityMetaSchema,
  ExplainabilityEvidenceSchema,
  ExplainabilitySchema,
  FORBIDDEN_META_FIELDS,
  createStateEvidence,
  createCorrelationEvidence,
  createRuleEvidence,
  createEventEvidence,
  createHeuristicEvidence,
};

export type {
  ExplainabilityEvidenceKind,
  ExplainabilityRefType,
  ExplainabilityTimeWindow,
  ExplainabilitySensitivity,
  ExplainabilityRef,
  ExplainabilityMeta,
  ExplainabilityEvidence,
  Explainability,
};
