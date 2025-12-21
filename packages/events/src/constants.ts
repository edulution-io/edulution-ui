/*
 * LICENSE PLACEHOLDER
 */

export const SCHEMA_VERSION = '1.0.0';

export const REDIS_KEYS = {
  STREAM_PREFIX: 'events:stream:',
  DLQ_PREFIX: 'events:dlq:',
  DEDUP_PREFIX: 'events:dedup:',
  PUBLISH_DEDUP_PREFIX: 'events:pubdedup:',
  IDEMPOTENCY_PREFIX: 'events:idem:',
  USER_LASTSEEN_PREFIX: 'state:user:',
  USER_LASTSEEN_SUFFIX: ':lastseen',
  USER_COUNTS_1H_SUFFIX: ':counts:1h',
  USER_COUNTS_24H_SUFFIX: ':counts:24h',
  USER_SIGNALS_SUFFIX: ':signals',
  CONTEXT_PREFIX: 'state:context:',
  CONTEXT_EVENTS_SUFFIX: ':events',
  CORRELATION_PREFIX: 'state:correlation:',
  CORRELATION_PENDING: 'state:correlation:pending',
  COMMUNICATIONS_PREFIX: 'state:communications:',
  COMMUNICATIONS_OPEN_SUFFIX: ':open',
  COMMUNICATIONS_AWAITING_SUFFIX: ':awaiting',
  CALENDAR_PREFIX: 'state:calendar:',
  CALENDAR_UPCOMING_SUFFIX: ':upcoming',
  CONFERENCES_ACTIVE: 'state:conferences:active',
  META_SCHEMA_VERSION: 'meta:schema:version',
  META_STREAMS_SOURCES: 'meta:streams:sources',
  META_CONSUMERS_ACTIVE: 'meta:consumers:active',
} as const;

export const CONSUMER_GROUPS = {
  AGGREGATORS: 'aggregators',
  ARCHIVER: 'archiver',
} as const;

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY_MS: 1000,
  BACKOFF_MULTIPLIER: 2,
  MAX_DELAY_MS: 30000,
} as const;

export const TTL_CONFIG = {
  DEDUP_TTL_SECONDS: 86400,
  COUNTS_1H_TTL_SECONDS: 3600,
  COUNTS_24H_TTL_SECONDS: 86400,
  SIGNALS_TTL_SECONDS: 300,
  CORRELATION_TTL_SECONDS: 3600,
  CONSUMER_HEARTBEAT_SECONDS: 60,
} as const;

export const STREAM_CONFIG = {
  MAX_STREAM_LENGTH: 100000,
  MAX_DLQ_LENGTH: 10000,
  READ_COUNT: 100,
  BLOCK_MS: 5000,
  PENDING_CLAIM_MS: 60000,
} as const;

export const METADATA_LIMITS = {
  MAX_PROPERTIES: 50,
  MAX_STRING_LENGTH: 1000,
} as const;

export const PAYLOAD_LIMITS = {
  MAX_PROPERTIES: 20,
} as const;

export const PII_FIELDS = {
  IDENTIFIER: ['user_id', 'actor_id', 'tenant_id'],
  POTENTIALLY_SENSITIVE: ['object.object_ref'],
  REVIEW_REQUIRED: ['metadata.*'],
  MUST_BE_REDACTED: ['payload.*'],
} as const;

export const buildStreamKey = (source: string): string => `${REDIS_KEYS.STREAM_PREFIX}${source}`;

export const buildDlqKey = (source: string): string => `${REDIS_KEYS.DLQ_PREFIX}${source}`;

export const buildDedupKey = (eventId: string): string => `${REDIS_KEYS.DEDUP_PREFIX}${eventId}`;

export const buildPublishDedupKey = (eventId: string): string => `${REDIS_KEYS.PUBLISH_DEDUP_PREFIX}${eventId}`;

export const buildIdempotencyKey = (key: string): string => `${REDIS_KEYS.IDEMPOTENCY_PREFIX}${key}`;

export const buildUserLastSeenKey = (userId: string): string =>
  `${REDIS_KEYS.USER_LASTSEEN_PREFIX}${userId}${REDIS_KEYS.USER_LASTSEEN_SUFFIX}`;

export const buildUserCounts1hKey = (userId: string): string =>
  `${REDIS_KEYS.USER_LASTSEEN_PREFIX}${userId}${REDIS_KEYS.USER_COUNTS_1H_SUFFIX}`;

export const buildUserCounts24hKey = (userId: string): string =>
  `${REDIS_KEYS.USER_LASTSEEN_PREFIX}${userId}${REDIS_KEYS.USER_COUNTS_24H_SUFFIX}`;

export const buildUserSignalsKey = (userId: string): string =>
  `${REDIS_KEYS.USER_LASTSEEN_PREFIX}${userId}${REDIS_KEYS.USER_SIGNALS_SUFFIX}`;

export const buildContextKey = (contextId: string): string => `${REDIS_KEYS.CONTEXT_PREFIX}${contextId}`;

export const buildContextEventsKey = (contextId: string): string =>
  `${REDIS_KEYS.CONTEXT_PREFIX}${contextId}${REDIS_KEYS.CONTEXT_EVENTS_SUFFIX}`;

export const buildCorrelationKey = (correlationId: string): string =>
  `${REDIS_KEYS.CORRELATION_PREFIX}${correlationId}`;

export const buildCommunicationsOpenKey = (userId: string): string =>
  `${REDIS_KEYS.COMMUNICATIONS_PREFIX}${userId}${REDIS_KEYS.COMMUNICATIONS_OPEN_SUFFIX}`;

export const buildCommunicationsAwaitingKey = (userId: string): string =>
  `${REDIS_KEYS.COMMUNICATIONS_PREFIX}${userId}${REDIS_KEYS.COMMUNICATIONS_AWAITING_SUFFIX}`;

export const buildCalendarUpcomingKey = (userId: string): string =>
  `${REDIS_KEYS.CALENDAR_PREFIX}${userId}${REDIS_KEYS.CALENDAR_UPCOMING_SUFFIX}`;

export const SUMMARY_PREFIX = 'summary:user:';

export const buildSummaryKey = (userId: string, date: string): string =>
  `${SUMMARY_PREFIX}${userId}:${date}`;

export const RECO_OUTBOX_PREFIX = 'reco:outbox:user:';
export const RECO_CANDIDATE_PREFIX = 'reco:candidate:';

export const RECO_CANDIDATE_TTL_SECONDS = 7 * 24 * 60 * 60;
export const RECO_OUTBOX_TTL_SECONDS = 7 * 24 * 60 * 60;

export const buildRecoOutboxKey = (userId: string): string =>
  `${RECO_OUTBOX_PREFIX}${userId}`;

export const buildRecoCandidateKey = (candidateId: string): string =>
  `${RECO_CANDIDATE_PREFIX}${candidateId}`;