/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import type { RecommendationCandidate, ExplainabilityEvidence } from '@edulution/events';
import RecommendationsService from './recommendations.service';

export interface WhyResponse {
  candidate_id: string;
  title: string;
  class: string;
  summary: string;
  evidence: ExplainabilityEvidence[];
  rendered_why: string;
}

@Injectable()
class WhyService {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  async getWhy(userId: string, candidateId: string): Promise<WhyResponse> {
    const candidate = await this.recommendationsService.getCandidate(candidateId);

    if (!candidate || candidate.user_id !== userId) {
      throw new NotFoundException(`Candidate ${candidateId} not found for user ${userId}`);
    }

    if (!candidate.explainability) {
      throw new NotFoundException(`Candidate ${candidateId} has no explainability data`);
    }

    return {
      candidate_id: candidate.candidate_id,
      title: candidate.title,
      class: candidate.class,
      summary: candidate.explainability.summary,
      evidence: candidate.explainability.evidence,
      rendered_why: WhyService.renderWhy(candidate),
    };
  }

  private static renderWhy(candidate: RecommendationCandidate): string {
    const exp = candidate.explainability;
    if (!exp) return candidate.rationale;

    const parts: string[] = [];

    parts.push(exp.summary);

    exp.evidence.forEach((item) => {
      if (item.kind === 'state') {
        parts.push(WhyService.renderStateEvidence(item));
      } else if (item.kind === 'correlation') {
        parts.push(WhyService.renderCorrelationEvidence(item));
      } else if (item.kind === 'event') {
        parts.push(WhyService.renderEventEvidence(item));
      } else if (item.kind === 'heuristic') {
        parts.push(WhyService.renderHeuristicEvidence(item));
      }
    });

    return parts.filter((p) => p).join(' ');
  }

  private static renderStateEvidence(item: ExplainabilityEvidence): string {
    const { label, meta } = item;

    const metaDesc = WhyService.renderMeta(meta);
    if (metaDesc) {
      return `${label}: ${metaDesc}.`;
    }
    return '';
  }

  private static renderCorrelationEvidence(item: ExplainabilityEvidence): string {
    return `This is based on ${item.label.toLowerCase()}.`;
  }

  private static renderEventEvidence(item: ExplainabilityEvidence): string {
    const source = item.refs[0]?.source;
    if (source) {
      return `Related to activity from ${source}.`;
    }
    return '';
  }

  private static renderHeuristicEvidence(item: ExplainabilityEvidence): string {
    const { meta } = item;
    const metaDesc = WhyService.renderMeta(meta);
    if (metaDesc) {
      return `${item.label}: ${metaDesc}.`;
    }
    return `${item.label}.`;
  }

  private static renderMeta(meta: Record<string, unknown>): string {
    const parts: string[] = [];

    Object.entries(meta).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      const label = key.replace(/_/g, ' ').replace(/count$/, '');

      if (typeof value === 'number') {
        parts.push(`${WhyService.numberToWord(value)} ${label}`);
      } else if (typeof value === 'boolean') {
        if (value) {
          parts.push(label);
        }
      }
    });

    return parts.join(', ');
  }

  private static numberToWord(n: number): string {
    if (n === 0) return 'no';
    if (n === 1) return 'one';
    if (n === 2) return 'two';
    if (n === 3) return 'three';
    if (n === 4) return 'four';
    if (n === 5) return 'five';
    if (n <= 10) return 'several';
    if (n <= 20) return 'many';
    return 'numerous';
  }
}

export default WhyService;
