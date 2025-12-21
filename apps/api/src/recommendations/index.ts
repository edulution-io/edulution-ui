/*
 * LICENSE PLACEHOLDER
 */

export { default as RecommendationsModule } from './recommendations.module';
export { default as RecommendationsService } from './recommendations.service';
export { default as RecommendationsController } from './recommendations.controller';
export {
  RuleEngineService,
  BaseRule,
  DEFAULT_RULE_CONFIG,
} from './rules';
export type {
  Rule,
  RuleContext,
  RuleResult,
  RuleConfig,
  RuleInfo,
  GenerateResult,
} from './rules';
