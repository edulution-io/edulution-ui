/*
 * LICENSE PLACEHOLDER
 */

import { Injectable } from '@nestjs/common';
import {
  RECOMMENDATION_CLASSES,
  createEventEvidence,
  createHeuristicEvidence,
  createActionStep,
  createActionProposal,
} from '@edulution/events';
import type {
  Explainability,
  RecommendationCandidate,
  ActionProposal,
} from '@edulution/events';
import ConferencesAggregator from '../../../events/aggregators/conferences.aggregator';
import { generateDedupKey , computeSourcesInvolved } from '../../utils';
import { getReversibleStatus } from '../../config';

const RULE_ID = 'reco.resources.conference_folder';
const RULE_VERSION = '1.0.0';

interface ConferenceEventInput {
  event_id: string;
  action: string;
  conference_id: string;
  subject_name: string;
  scheduled_at?: string;
  occurred_at: string;
}

@Injectable()
class ConferenceFolderRule {
  static readonly RULE_ID = RULE_ID;

  static readonly RULE_VERSION = RULE_VERSION;

  constructor(private readonly conferencesAggregator: ConferencesAggregator) {}

  async evaluate(
    userId: string,
    event: ConferenceEventInput,
  ): Promise<RecommendationCandidate | null> {
    if (event.action !== 'conference.created') {
      return null;
    }

    if (!event.subject_name || event.subject_name.trim().length === 0) {
      return null;
    }

    const folderName = this.deriveFolderName(
      event.subject_name,
      event.scheduled_at || event.occurred_at,
    );
    const year = this.extractYear(event.scheduled_at || event.occurred_at);
    const normalizedSubject = this.normalizeSubject(event.subject_name);

    const alreadySuggested = await this.conferencesAggregator.isFolderSuggested(
      userId,
      normalizedSubject,
      year,
    );

    if (alreadySuggested) {
      return null;
    }

    await this.conferencesAggregator.markFolderSuggested(userId, normalizedSubject, year);

    const explainability: Explainability = {
      rule_id: RULE_ID,
      rule_version: RULE_VERSION,
      summary:
        'A new conference was created. Organizing resources in a dedicated folder reduces friction.',
      evidence: [
        createEventEvidence(
          'Conference created',
          event.event_id,
          'conferences',
          event.occurred_at,
          { subject_name: event.subject_name },
        ),
        createHeuristicEvidence(
          'Folder name derived deterministically',
          [{ ref_type: 'rule_id', ref: RULE_ID }],
          { name: folderName },
        ),
      ],
    };

    const steps = [
      createActionStep(
        'create-folder',
        'files.create_folder',
        `Create folder ${folderName} in /Ressourcen`,
        { name: folderName, path: '/Ressourcen' },
      ),
    ];

    const actionProposal: ActionProposal = createActionProposal(
      `${RULE_ID}:${event.conference_id}`,
      `Create folder for ${event.subject_name}`,
      'Create a dedicated resources folder for the conference materials',
      steps,
      {
        trigger_event_id: event.event_id,
        trigger_action: 'conference.created',
        source: 'conferences',
      },
      { impact: 'low', reversible: getReversibleStatus(steps) },
    );

    const dedupKey = generateDedupKey(RULE_ID, event.conference_id, userId);

    return {
      candidate_id: `${RULE_ID}:${event.conference_id}`,
      dedup_key: dedupKey,
      user_id: userId,
      created_at: new Date().toISOString(),
      class: RECOMMENDATION_CLASSES.ORGANIZATION,
      title: `Create resources folder for ${event.subject_name}`,
      rationale: `A conference for ${event.subject_name} was created. A dedicated folder helps organize materials.`,
      scores: {
        confidence: 0.7,
        impact: 0.6,
        effort: 0.3,
      },
      sources_involved: computeSourcesInvolved(explainability),
      context_id: event.conference_id,
      explainability,
      evidence: [
        {
          kind: 'event',
          ref: event.event_id,
          meta: { subject_name: event.subject_name },
        },
      ],
      action_proposal: actionProposal,
      push_title: `Ordner für ${event.subject_name} erstellen`,
      push_content: `Ressourcen-Ordner für Konferenz "${event.subject_name}" anlegen?`,
    };
  }

  private deriveFolderName(subject: string, dateStr: string): string {
    const normalized = this.normalizeSubjectForFolder(subject);
    const year = this.extractYear(dateStr);
    return `${normalized}_${year}`;
  }

  private normalizeSubject(subject: string): string {
    return subject
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_äöüß]/g, '');
  }

  private normalizeSubjectForFolder(subject: string): string {
    return subject
      .trim()
      .replace(/[^a-zA-Z0-9\s_äöüÄÖÜß]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_');
  }

  private extractYear(dateStr: string): string {
    try {
      return new Date(dateStr).getFullYear().toString();
    } catch {
      return new Date().getFullYear().toString();
    }
  }
}

export default ConferenceFolderRule;
export { RULE_ID, RULE_VERSION };
export type { ConferenceEventInput };
