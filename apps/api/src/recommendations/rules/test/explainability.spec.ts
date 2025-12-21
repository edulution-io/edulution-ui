/*
 * LICENSE PLACEHOLDER
 */

import {
  ExplainabilityEvidenceSchema,
  ExplainabilitySchema,
  ExplainabilityMetaSchema,
  createStateEvidence,
  createCorrelationEvidence,
  createRuleEvidence,
  createEventEvidence,
  createHeuristicEvidence,
} from '@edulution/events';
import { RULE_REGISTRY, getRuleIds, getRuleVersion } from '../rule-registry';

describe('Explainability Types', () => {
  describe('ExplainabilityMetaSchema', () => {
    it('should accept valid meta', () => {
      const validMeta = {
        count: 5,
        has_flag: true,
        status: 'active',
        value: null,
      };

      const result = ExplainabilityMetaSchema.safeParse(validMeta);
      expect(result.success).toBe(true);
    });

    it('should reject meta with forbidden "body" field', () => {
      const invalidMeta = {
        body: 'some email content',
      };

      const result = ExplainabilityMetaSchema.safeParse(invalidMeta);
      expect(result.success).toBe(false);
    });

    it('should reject meta with forbidden "subject" field', () => {
      const invalidMeta = {
        subject: 'Re: Meeting tomorrow',
      };

      const result = ExplainabilityMetaSchema.safeParse(invalidMeta);
      expect(result.success).toBe(false);
    });

    it('should reject meta with forbidden "content" field', () => {
      const invalidMeta = {
        message_content: 'Hello world',
      };

      const result = ExplainabilityMetaSchema.safeParse(invalidMeta);
      expect(result.success).toBe(false);
    });

    it('should reject meta with "text" in field name', () => {
      const invalidMeta = {
        body_text: 'Some text',
      };

      const result = ExplainabilityMetaSchema.safeParse(invalidMeta);
      expect(result.success).toBe(false);
    });

    it('should accept numeric and boolean meta values', () => {
      const validMeta = {
        thread_count: 5,
        is_stale: true,
        priority_level: 3,
      };

      const result = ExplainabilityMetaSchema.safeParse(validMeta);
      expect(result.success).toBe(true);
    });
  });

  describe('ExplainabilityEvidenceSchema', () => {
    it('should accept valid evidence item', () => {
      const item = {
        kind: 'state',
        label: 'Awaiting replies',
        refs: [{ ref_type: 'redis_key', ref: 'state:comm:user1' }],
        meta: { count: 5 },
        sensitivity: 'low',
      };

      const result = ExplainabilityEvidenceSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it('should reject evidence with empty refs', () => {
      const item = {
        kind: 'state',
        label: 'Test',
        refs: [],
        meta: {},
      };

      const result = ExplainabilityEvidenceSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it('should reject evidence with invalid kind', () => {
      const item = {
        kind: 'invalid_kind',
        label: 'Test',
        refs: [{ ref_type: 'redis_key', ref: 'key' }],
      };

      const result = ExplainabilityEvidenceSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it('should accept all valid evidence kinds', () => {
      const kinds = ['state', 'event', 'correlation', 'rule', 'heuristic'];

      kinds.forEach((kind) => {
        const item = {
          kind,
          label: 'Test label',
          refs: [{ ref_type: 'redis_key', ref: 'test-key' }],
          meta: {},
          sensitivity: 'low',
        };

        const result = ExplainabilityEvidenceSchema.safeParse(item);
        expect(result.success).toBe(true);
      });
    });

    it('should accept all valid ref types', () => {
      const refTypes = ['redis_key', 'correlation_id', 'event_id', 'object_ref', 'rule_id'];

      refTypes.forEach((refType) => {
        const item = {
          kind: 'state',
          label: 'Test',
          refs: [{ ref_type: refType, ref: 'test-ref' }],
          meta: {},
          sensitivity: 'low',
        };

        const result = ExplainabilityEvidenceSchema.safeParse(item);
        expect(result.success).toBe(true);
      });
    });

    it('should reject empty label', () => {
      const item = {
        kind: 'state',
        label: '',
        refs: [{ ref_type: 'redis_key', ref: 'key' }],
      };

      const result = ExplainabilityEvidenceSchema.safeParse(item);
      expect(result.success).toBe(false);
    });
  });

  describe('ExplainabilitySchema', () => {
    it('should accept valid explainability', () => {
      const exp = {
        rule_id: 'reco.comm.awaiting_reply',
        rule_version: '1.0.0',
        summary: 'Several items need attention.',
        evidence: [
          {
            kind: 'state',
            label: 'Awaiting',
            refs: [{ ref_type: 'redis_key', ref: 'state:key' }],
            meta: {},
            sensitivity: 'low',
          },
        ],
      };

      const result = ExplainabilitySchema.safeParse(exp);
      expect(result.success).toBe(true);
    });

    it('should reject explainability with empty evidence', () => {
      const exp = {
        rule_id: 'reco.test',
        rule_version: '1.0.0',
        summary: 'Test',
        evidence: [],
      };

      const result = ExplainabilitySchema.safeParse(exp);
      expect(result.success).toBe(false);
    });

    it('should reject invalid semver version', () => {
      const exp = {
        rule_id: 'reco.test',
        rule_version: 'v1',
        summary: 'Test',
        evidence: [
          {
            kind: 'rule',
            label: 'Test',
            refs: [{ ref_type: 'rule_id', ref: 'x' }],
            meta: {},
            sensitivity: 'low',
          },
        ],
      };

      const result = ExplainabilitySchema.safeParse(exp);
      expect(result.success).toBe(false);
    });

    it('should accept valid semver versions', () => {
      const versions = ['1.0.0', '2.3.4', '10.20.30', '0.0.1'];

      versions.forEach((version) => {
        const exp = {
          rule_id: 'reco.test',
          rule_version: version,
          summary: 'Test summary',
          evidence: [
            {
              kind: 'rule',
              label: 'Test',
              refs: [{ ref_type: 'rule_id', ref: 'test' }],
              meta: {},
              sensitivity: 'low',
            },
          ],
        };

        const result = ExplainabilitySchema.safeParse(exp);
        expect(result.success).toBe(true);
      });
    });

    it('should reject empty summary', () => {
      const exp = {
        rule_id: 'reco.test',
        rule_version: '1.0.0',
        summary: '',
        evidence: [
          {
            kind: 'rule',
            label: 'Test',
            refs: [{ ref_type: 'rule_id', ref: 'x' }],
            meta: {},
            sensitivity: 'low',
          },
        ],
      };

      const result = ExplainabilitySchema.safeParse(exp);
      expect(result.success).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    it('should create valid state evidence', () => {
      const evidence = createStateEvidence(
        'Active threads',
        'state:comm:user1:threads',
        'mail',
        'today',
        { thread_count: 5 },
      );

      expect(evidence.kind).toBe('state');
      expect(evidence.refs[0].ref_type).toBe('redis_key');
      expect(evidence.refs[0].source).toBe('mail');
      expect(evidence.refs[0].time_window).toBe('today');

      const result = ExplainabilityEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
    });

    it('should create valid correlation evidence', () => {
      const evidence = createCorrelationEvidence('Meeting preparation', 'meeting-prep-correlation', {
        linked: true,
      });

      expect(evidence.kind).toBe('correlation');
      expect(evidence.refs[0].ref_type).toBe('correlation_id');
      expect(evidence.meta.linked).toBe(true);

      const result = ExplainabilityEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
    });

    it('should create valid rule evidence', () => {
      const evidence = createRuleEvidence('reco.comm.awaiting_reply');

      expect(evidence.kind).toBe('rule');
      expect(evidence.refs[0].ref_type).toBe('rule_id');
      expect(evidence.refs[0].ref).toBe('reco.comm.awaiting_reply');
      expect(evidence.label).toBe('Rule triggered');

      const result = ExplainabilityEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
    });

    it('should create valid event evidence', () => {
      const evidence = createEventEvidence(
        'Upcoming meeting',
        'meeting-123',
        'caldav',
        '2024-01-15T10:00:00.000Z',
        { is_imminent: true },
      );

      expect(evidence.kind).toBe('event');
      expect(evidence.refs[0].ref_type).toBe('event_id');
      expect(evidence.refs[0].source).toBe('caldav');
      expect(evidence.sensitivity).toBe('medium');

      const result = ExplainabilityEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
    });

    it('should create valid heuristic evidence', () => {
      const evidence = createHeuristicEvidence(
        'End of day window',
        [{ ref_type: 'object_ref', ref: 'time-window', source: 'time' }],
        { hour: 17, is_eod: true },
      );

      expect(evidence.kind).toBe('heuristic');
      expect(evidence.refs[0].ref_type).toBe('object_ref');
      expect(evidence.meta.is_eod).toBe(true);

      const result = ExplainabilityEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
    });
  });

  describe('Rule Registry', () => {
    it('should have all required rules', () => {
      const ruleIds = getRuleIds();

      expect(ruleIds).toContain('reco.comm.awaiting_reply');
      expect(ruleIds).toContain('reco.comm.high_volume');
      expect(ruleIds).toContain('reco.meeting.upcoming');
      expect(ruleIds).toContain('reco.meeting.busy_schedule');
      expect(ruleIds).toContain('reco.focus.deep_work');
      expect(ruleIds).toContain('reco.focus.break_needed');
      expect(ruleIds).toContain('reco.planning.end_of_day');
      expect(ruleIds).toContain('reco.cleanup.stale_threads');
    });

    it('should have valid semver versions for all rules', () => {
      const semverRegex = /^\d+\.\d+\.\d+$/;

      Object.entries(RULE_REGISTRY).forEach(([id, rule]) => {
        expect(rule.version).toMatch(semverRegex);
        expect(rule.id).toBe(id);
      });
    });

    it('should have sources defined for all rules', () => {
      Object.values(RULE_REGISTRY).forEach((rule) => {
        expect(rule.sources.length).toBeGreaterThan(0);
      });
    });

    it('should have valid class for all rules', () => {
      const validClasses = ['communication', 'meeting', 'focus', 'planning', 'cleanup', 'organization'];

      Object.values(RULE_REGISTRY).forEach((rule) => {
        expect(validClasses).toContain(rule.class);
      });
    });

    it('should return correct version for known rule', () => {
      const version = getRuleVersion('reco.comm.awaiting_reply');
      expect(version).toBe('1.0.0');
    });

    it('should return default version for unknown rule', () => {
      const version = getRuleVersion('unknown.rule');
      expect(version).toBe('1.0.0');
    });
  });
});
