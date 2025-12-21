/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES, createStateEvidence, createCorrelationEvidence } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

class OrganizeFilesRule extends BaseRule {
  readonly id = 'reco.cleanup.organize_files';

  readonly name = 'File Organization';

  readonly class = RECOMMENDATION_CLASSES.CLEANUP;

  readonly priority = 20;

  readonly sources = ['files', 'signals'];

  readonly usesCorrelation = true;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const { user_id: userId, counts_24h: counts24h, signals } = context;

    const fileEvents = Object.entries(counts24h)
      .filter(([type]) => type.startsWith('file.'))
      .reduce((sum, [, count]) => sum + count, 0);

    const threshold = this.getThreshold('file_event_count', 20);

    if (fileEvents < threshold) {
      return [];
    }

    if (signals.activity_level === 'high') {
      return [];
    }

    const evidenceItems = [
      createStateEvidence(
        'File activity',
        `state:user:${userId}:files`,
        'files',
        '24h',
        { file_events: fileEvents },
      ),
      createCorrelationEvidence(
        'High file activity pattern',
        'file-organization-opportunity',
        { threshold, activity_level: signals.activity_level },
      ),
    ];

    return [
      this.createResult({
        class: this.class,
        title: 'Organize recent files',
        rationale: 'High file activity today - consider organizing.',
        score: 0.45,
        evidenceItems,
        evidence: [
          {
            kind: 'file_activity',
            ref: 'high-file-activity',
            meta: { file_events: fileEvents },
          },
        ],
        tags: ['files', 'organization'],
      }),
    ];
  }
}

export default OrganizeFilesRule;
