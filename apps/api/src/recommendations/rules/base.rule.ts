/*
 * LICENSE PLACEHOLDER
 */

import { randomUUID } from 'crypto';
import type { RecommendationClass, Explainability, ExplainabilityEvidence } from '@edulution/events';
import { createRuleEvidence } from '@edulution/events';
import type { Rule, RuleContext, RuleResult, RuleConfig } from './rule.interface';
import { DEFAULT_RULE_CONFIG } from './rule.interface';
import { getRuleVersion } from './rule-registry';

abstract class BaseRule implements Rule {
  abstract readonly id: string;

  abstract readonly name: string;

  abstract readonly class: RecommendationClass;

  abstract readonly sources: string[];

  abstract readonly usesCorrelation: boolean;

  readonly priority: number = 50;

  protected config: RuleConfig = DEFAULT_RULE_CONFIG;

  setConfig(config: Partial<RuleConfig>): void {
    this.config = { ...this.config, ...config };
  }

  abstract evaluate(context: RuleContext): RuleResult[];

  protected createResult(
    params: Omit<RuleResult, 'rule_id' | 'explainability'> & {
      rule_id?: string;
      explainability?: Explainability;
      evidenceItems?: ExplainabilityEvidence[];
    },
  ): RuleResult {
    const ruleId = this.id;
    const ruleVersion = getRuleVersion(ruleId);

    const explainability: Explainability = params.explainability ?? {
      rule_id: ruleId,
      rule_version: ruleVersion,
      summary: params.rationale,
      evidence: [
        ...(params.evidenceItems || []),
        createRuleEvidence(ruleId),
      ],
    };

    return {
      rule_id: params.rule_id ?? `${this.id}:${randomUUID().slice(0, 8)}`,
      class: params.class,
      title: params.title,
      rationale: params.rationale,
      score: Math.max(0, Math.min(1, params.score)),
      explainability,
      evidence: params.evidence,
      context_id: params.context_id,
      tags: params.tags,
      metadata: params.metadata,
    };
  }

  protected createExplainability(
    summary: string,
    evidenceItems: ExplainabilityEvidence[],
  ): Explainability {
    return {
      rule_id: this.id,
      rule_version: getRuleVersion(this.id),
      summary,
      evidence: [...evidenceItems, createRuleEvidence(this.id)],
    };
  }

  protected getThreshold(key: string, defaultValue: number): number {
    return this.config.thresholds?.[key] ?? defaultValue;
  }

  protected isEnabled(): boolean {
    return this.config.enabled;
  }

  protected static daysSince(timestamp: number | string, now: number): number {
    const ts = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
    return (now - ts) / (1000 * 60 * 60 * 24);
  }

  protected static hoursSince(timestamp: number | string, now: number): number {
    const ts = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
    return (now - ts) / (1000 * 60 * 60);
  }

  protected static minutesUntil(timestamp: number | string, now: number): number {
    const ts = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
    return (ts - now) / (1000 * 60);
  }
}

export default BaseRule;
