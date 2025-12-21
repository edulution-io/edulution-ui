/*
 * LICENSE PLACEHOLDER
 */

import {
  ExplainabilitySchema,
  ExplainabilityEvidenceSchema,
  FORBIDDEN_META_FIELDS,
  createStateEvidence,
  createCorrelationEvidence,
  createRuleEvidence,
  createEventEvidence,
  createHeuristicEvidence,
} from '@edulution/events';
import { RULE_REGISTRY, getRuleIds, getRuleVersion } from '../rules/rule-registry';
import { getAllRules } from '../rules/scoring-rules';
import type { RuleContext } from '../rules/rule.interface';

const createMockContext = (overrides: Partial<RuleContext> = {}): RuleContext => ({
  user_id: 'test-user-1',
  timestamp: Date.now(),
  signals: {
    activity_level: 'high',
    primary_source: 'mail',
    pending_communications: 5,
    upcoming_meetings: 2,
    last_computed: new Date().toISOString(),
  },
  last_seen: {
    mail: Date.now() - 1000 * 60 * 30,
    files: Date.now() - 1000 * 60 * 120,
    conferences: Date.now() - 1000 * 60 * 60 * 24,
    chat: null,
    caldav: Date.now() - 1000 * 60 * 60,
  },
  counts_1h: { mail: 10, files: 3, conferences: 0, chat: 0 },
  counts_24h: { mail: 45, files: 12, conferences: 2, chat: 5 },
  communications: {
    open_threads: [
      { thread_id: 'thread-1', participants: 2, last_activity: Date.now() - 1000 * 60 * 60 * 48 },
      { thread_id: 'thread-2', participants: 3, last_activity: Date.now() - 1000 * 60 * 60 * 24 },
    ],
    awaiting_reply: ['thread-1', 'thread-2'],
  },
  upcoming_meetings: [
    {
      meeting_id: 'meeting-1',
      title: 'Team Sync',
      scheduled_at: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    },
  ],
  ...overrides,
});

describe('Explainability Generator Tests', () => {
  describe('Rule Evidence Generation', () => {
    it('should generate valid explainability from all rules', () => {
      const rules = getAllRules();
      const context = createMockContext();

      rules.forEach((rule) => {
        const results = rule.evaluate(context);

        results.forEach((result) => {
          expect(result.explainability).toBeDefined();
          expect(result.explainability?.rule_id).toBeDefined();
          expect(result.explainability?.rule_version).toBeDefined();
          expect(result.explainability?.summary).toBeDefined();
          expect(result.explainability?.evidence.length).toBeGreaterThan(0);
        });
      });
    });

    it('should produce valid Zod-parseable explainability', () => {
      const rules = getAllRules();
      const context = createMockContext();

      rules.forEach((rule) => {
        const results = rule.evaluate(context);

        results.forEach((result) => {
          if (result.explainability) {
            const parseResult = ExplainabilitySchema.safeParse(result.explainability);
            expect(parseResult.success).toBe(true);
          }
        });
      });
    });

    it('should not include forbidden meta fields in evidence', () => {
      const rules = getAllRules();
      const context = createMockContext();

      rules.forEach((rule) => {
        const results = rule.evaluate(context);

        results.forEach((result) => {
          if (result.explainability) {
            result.explainability.evidence.forEach((evidence) => {
              const metaKeys = Object.keys(evidence.meta || {});
              const hasForbidden = metaKeys.some((key) =>
                FORBIDDEN_META_FIELDS.some((f) => key.toLowerCase().includes(f)),
              );
              expect(hasForbidden).toBe(false);
            });
          }
        });
      });
    });

    it('should have rule_id that matches a registered rule', () => {
      const rules = getAllRules();
      const context = createMockContext();
      const registeredIds = getRuleIds();

      rules.forEach((rule) => {
        const results = rule.evaluate(context);

        results.forEach((result) => {
          if (result.explainability) {
            expect(registeredIds).toContain(result.explainability.rule_id);
          }
        });
      });
    });

    it('should have valid semver rule_version', () => {
      const semverRegex = /^\d+\.\d+\.\d+$/;
      const rules = getAllRules();
      const context = createMockContext();

      rules.forEach((rule) => {
        const results = rule.evaluate(context);

        results.forEach((result) => {
          if (result.explainability) {
            expect(result.explainability.rule_version).toMatch(semverRegex);
          }
        });
      });
    });

    it('should have at least one evidence item per candidate', () => {
      const rules = getAllRules();
      const context = createMockContext();

      rules.forEach((rule) => {
        const results = rule.evaluate(context);

        results.forEach((result) => {
          if (result.explainability) {
            expect(result.explainability.evidence.length).toBeGreaterThan(0);
          }
        });
      });
    });

    it('should have non-empty labels for all evidence items', () => {
      const rules = getAllRules();
      const context = createMockContext();

      rules.forEach((rule) => {
        const results = rule.evaluate(context);

        results.forEach((result) => {
          if (result.explainability) {
            result.explainability.evidence.forEach((evidence) => {
              expect(evidence.label.length).toBeGreaterThan(0);
            });
          }
        });
      });
    });

    it('should have valid refs for all evidence items', () => {
      const rules = getAllRules();
      const context = createMockContext();
      const validRefTypes = ['redis_key', 'correlation_id', 'event_id', 'object_ref', 'rule_id'];

      rules.forEach((rule) => {
        const results = rule.evaluate(context);

        results.forEach((result) => {
          if (result.explainability) {
            result.explainability.evidence.forEach((evidence) => {
              expect(evidence.refs.length).toBeGreaterThan(0);
              evidence.refs.forEach((ref) => {
                expect(validRefTypes).toContain(ref.ref_type);
                expect(ref.ref.length).toBeGreaterThan(0);
              });
            });
          }
        });
      });
    });
  });

  describe('Evidence Creation Helpers', () => {
    it('createStateEvidence produces valid evidence', () => {
      const evidence = createStateEvidence(
        'Test state',
        'state:test:key',
        'mail',
        'today',
        { count: 5 },
      );

      const result = ExplainabilityEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
      expect(evidence.kind).toBe('state');
      expect(evidence.refs[0].ref_type).toBe('redis_key');
    });

    it('createCorrelationEvidence produces valid evidence', () => {
      const evidence = createCorrelationEvidence(
        'Related items',
        'corr-123',
        { linked: true },
      );

      const result = ExplainabilityEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
      expect(evidence.kind).toBe('correlation');
      expect(evidence.refs[0].ref_type).toBe('correlation_id');
    });

    it('createRuleEvidence produces valid evidence', () => {
      const evidence = createRuleEvidence('reco.comm.awaiting_reply');

      const result = ExplainabilityEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
      expect(evidence.kind).toBe('rule');
      expect(evidence.refs[0].ref_type).toBe('rule_id');
      expect(evidence.label).toBe('Rule triggered');
    });

    it('createEventEvidence produces valid evidence', () => {
      const evidence = createEventEvidence(
        'Calendar event',
        'event-123',
        'caldav',
        '2024-01-15T10:00:00.000Z',
        { is_imminent: true },
      );

      const result = ExplainabilityEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
      expect(evidence.kind).toBe('event');
      expect(evidence.refs[0].ref_type).toBe('event_id');
      expect(evidence.sensitivity).toBe('medium');
    });

    it('createHeuristicEvidence produces valid evidence', () => {
      const evidence = createHeuristicEvidence(
        'Time-based heuristic',
        [{ ref_type: 'object_ref', ref: 'time-window' }],
        { hour: 17 },
      );

      const result = ExplainabilityEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
      expect(evidence.kind).toBe('heuristic');
    });
  });

  describe('Rule Registry Consistency', () => {
    it('all implemented rules should be in registry', () => {
      const rules = getAllRules();
      const registeredIds = getRuleIds();

      rules.forEach((rule) => {
        expect(registeredIds).toContain(rule.id);
      });
    });

    it('all registered rules should have valid versions', () => {
      const semverRegex = /^\d+\.\d+\.\d+$/;

      Object.values(RULE_REGISTRY).forEach((rule) => {
        expect(rule.version).toMatch(semverRegex);
      });
    });

    it('getRuleVersion returns correct version for known rules', () => {
      const rules = getAllRules();

      rules.forEach((rule) => {
        const version = getRuleVersion(rule.id);
        const registryVersion = RULE_REGISTRY[rule.id]?.version;

        if (registryVersion) {
          expect(version).toBe(registryVersion);
        }
      });
    });

    it('getRuleVersion returns default for unknown rules', () => {
      const version = getRuleVersion('unknown.rule.id');
      expect(version).toBe('1.0.0');
    });
  });

  describe('Explainability Data Integrity', () => {
    it('evidence kinds should be valid enum values', () => {
      const validKinds = ['state', 'event', 'correlation', 'rule', 'heuristic'];
      const rules = getAllRules();
      const context = createMockContext();

      rules.forEach((rule) => {
        const results = rule.evaluate(context);

        results.forEach((result) => {
          if (result.explainability) {
            result.explainability.evidence.forEach((evidence) => {
              expect(validKinds).toContain(evidence.kind);
            });
          }
        });
      });
    });

    it('sensitivity should be valid enum values', () => {
      const validSensitivities = ['low', 'medium', 'high'];
      const rules = getAllRules();
      const context = createMockContext();

      rules.forEach((rule) => {
        const results = rule.evaluate(context);

        results.forEach((result) => {
          if (result.explainability) {
            result.explainability.evidence.forEach((evidence) => {
              expect(validSensitivities).toContain(evidence.sensitivity);
            });
          }
        });
      });
    });

    it('summary should not exceed max length', () => {
      const rules = getAllRules();
      const context = createMockContext();

      rules.forEach((rule) => {
        const results = rule.evaluate(context);

        results.forEach((result) => {
          if (result.explainability) {
            expect(result.explainability.summary.length).toBeLessThanOrEqual(200);
          }
        });
      });
    });

    it('label should not exceed max length', () => {
      const rules = getAllRules();
      const context = createMockContext();

      rules.forEach((rule) => {
        const results = rule.evaluate(context);

        results.forEach((result) => {
          if (result.explainability) {
            result.explainability.evidence.forEach((evidence) => {
              expect(evidence.label.length).toBeLessThanOrEqual(100);
            });
          }
        });
      });
    });

    it('meta values should be primitive types only', () => {
      const rules = getAllRules();
      const context = createMockContext();

      rules.forEach((rule) => {
        const results = rule.evaluate(context);

        results.forEach((result) => {
          if (result.explainability) {
            result.explainability.evidence.forEach((evidence) => {
              Object.values(evidence.meta || {}).forEach((value) => {
                const isValidType =
                  typeof value === 'string' ||
                  typeof value === 'number' ||
                  typeof value === 'boolean' ||
                  value === null;
                expect(isValidType).toBe(true);
              });
            });
          }
        });
      });
    });
  });

  describe('Rule Evaluation Stability', () => {
    it('same context should produce consistent explainability structure', () => {
      const rules = getAllRules();
      const context = createMockContext();

      rules.forEach((rule) => {
        const results1 = rule.evaluate(context);
        const results2 = rule.evaluate(context);

        expect(results1.length).toBe(results2.length);

        results1.forEach((result1, index) => {
          const result2 = results2[index];
          if (result1.explainability && result2.explainability) {
            expect(result1.explainability.rule_id).toBe(result2.explainability.rule_id);
            expect(result1.explainability.rule_version).toBe(result2.explainability.rule_version);
            expect(result1.explainability.evidence.length).toBe(
              result2.explainability.evidence.length,
            );
          }
        });
      });
    });

    it('empty context should not produce errors', () => {
      const rules = getAllRules();
      const emptyContext = createMockContext({
        communications: { open_threads: [], awaiting_reply: [] },
        upcoming_meetings: [],
        counts_1h: { mail: 0, files: 0, conferences: 0, chat: 0 },
        counts_24h: { mail: 0, files: 0, conferences: 0, chat: 0 },
      });

      rules.forEach((rule) => {
        expect(() => rule.evaluate(emptyContext)).not.toThrow();
      });
    });
  });
});
