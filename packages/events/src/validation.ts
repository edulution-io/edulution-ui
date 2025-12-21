/*
 * LICENSE PLACEHOLDER
 */

import { z } from 'zod';
import { EVENT_SOURCES, EVENT_SENSITIVITY } from './types';

const eventSourceValues = Object.values(EVENT_SOURCES) as [string, ...string[]];
const sensitivityValues = Object.values(EVENT_SENSITIVITY) as [string, ...string[]];

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const eventTypeRegex = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;

export const EventObjectSchema = z.object({
  object_type: z.string().min(1).max(100),
  object_id: z.string().min(1).max(500),
  object_ref: z.string().max(2000).nullable().optional(),
});

export const EventContextSchema = z.object({
  context_id: z.string().nullable().optional(),
  project_id: z.string().nullable().optional(),
  thread_id: z.string().nullable().optional(),
  meeting_id: z.string().nullable().optional(),
  session_id: z.string().nullable().optional(),
  request_id: z.string().nullable().optional(),
});

export const EventMetadataSchema = z.record(
  z.string(),
  z.union([z.string().max(1000), z.number(), z.boolean(), z.null()])
);

export const EventPayloadSchema = z.record(z.string(), z.unknown());

export const EventSchema = z.object({
  event_id: z.string().regex(uuidRegex, 'Invalid UUID format'),
  schema_version: z.string().regex(semverRegex, 'Invalid semver format'),
  occurred_at: z.string().datetime({ message: 'Invalid ISO 8601 timestamp' }),
  received_at: z.string().datetime({ message: 'Invalid ISO 8601 timestamp' }),
  tenant_id: z.string().nullable().optional(),
  user_id: z.string().min(1).max(255),
  source: z.enum(eventSourceValues),
  type: z.string().regex(eventTypeRegex, 'Event type must be in format "domain.action"'),
  actor_id: z.string().nullable().optional(),
  object: EventObjectSchema,
  context: EventContextSchema.optional().default({}),
  correlation_id: z.string().min(1).max(255),
  causation_id: z.string().nullable().optional(),
  sensitivity: z.enum(sensitivityValues).default('low'),
  metadata: EventMetadataSchema.optional().default({}),
  payload: EventPayloadSchema.optional().default({}),
});

export const EventInputSchema = z.object({
  occurred_at: z.string().datetime().optional(),
  tenant_id: z.string().nullable().optional(),
  user_id: z.string().min(1).max(255),
  source: z.enum(eventSourceValues),
  type: z.string().regex(eventTypeRegex, 'Event type must be in format "domain.action"'),
  actor_id: z.string().nullable().optional(),
  object: EventObjectSchema,
  context: EventContextSchema.optional(),
  correlation_id: z.string().min(1).max(255).optional(),
  causation_id: z.string().nullable().optional(),
  sensitivity: z.enum(sensitivityValues).optional(),
  metadata: EventMetadataSchema.optional(),
  payload: EventPayloadSchema.optional(),
});

export type ValidatedEvent = z.infer<typeof EventSchema>;
export type ValidatedEventInput = z.infer<typeof EventInputSchema>;

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: z.ZodIssue[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateEvent = (event: unknown): ValidatedEvent => {
  const result = EventSchema.safeParse(event);
  if (!result.success) {
    const errorMessages = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    throw new ValidationError(`Event validation failed: ${errorMessages}`, result.error.issues);
  }
  return result.data;
};

export const validateEventInput = (input: unknown): ValidatedEventInput => {
  const result = EventInputSchema.safeParse(input);
  if (!result.success) {
    const errorMessages = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    throw new ValidationError(`Event input validation failed: ${errorMessages}`, result.error.issues);
  }
  return result.data;
};

export const isValidEvent = (event: unknown): event is ValidatedEvent => EventSchema.safeParse(event).success;

export const isValidEventInput = (input: unknown): input is ValidatedEventInput => EventInputSchema.safeParse(input).success;

const recommendationClassValues = ['communication', 'planning', 'cleanup', 'focus', 'meeting', 'organization'] as const;

export const EvidenceItemSchema = z.object({
  kind: z.string().min(1).max(50),
  ref: z.string().min(1).max(500),
  ts: z.string().datetime().optional(),
  meta: z.record(z.unknown()).optional(),
});

export const RecommendationScoresSchema = z.object({
  confidence: z.number().min(0).max(1),
  impact: z.number().min(0).max(1),
  effort: z.number().min(0).max(1),
});

export const RecommendationCandidateSchema = z.object({
  candidate_id: z.string().uuid(),
  user_id: z.string().min(1).max(255),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime().optional(),
  context_id: z.string().max(255).optional(),
  class: z.enum(recommendationClassValues),
  title: z.string().min(1).max(100),
  rationale: z.string().min(1).max(500),
  evidence: z.array(EvidenceItemSchema).max(10),
  scores: RecommendationScoresSchema,
  tags: z.array(z.string().max(50)).max(10).optional(),
  source_hints: z.array(z.string().max(50)).max(10).optional(),
});

export const RecommendationOutboxItemSchema = z.object({
  candidate_id: z.string().uuid(),
  score: z.number().min(0).max(1),
  created_at: z.string().datetime(),
  class: z.enum(recommendationClassValues),
  title: z.string().max(100),
  rationale: z.string().max(500),
  context_id: z.string().max(255).optional(),
});

export type ValidatedRecommendationCandidate = z.infer<typeof RecommendationCandidateSchema>;
export type ValidatedRecommendationOutboxItem = z.infer<typeof RecommendationOutboxItemSchema>;

export const validateRecommendationCandidate = (candidate: unknown): ValidatedRecommendationCandidate => {
  const result = RecommendationCandidateSchema.safeParse(candidate);
  if (!result.success) {
    const errorMessages = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    throw new ValidationError(`Recommendation candidate validation failed: ${errorMessages}`, result.error.issues);
  }
  return result.data;
};

export const isValidRecommendationCandidate = (candidate: unknown): candidate is ValidatedRecommendationCandidate =>
  RecommendationCandidateSchema.safeParse(candidate).success;
