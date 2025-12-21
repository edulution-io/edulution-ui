/*
 * LICENSE PLACEHOLDER
 */

export type RecommendationVariant =
  | 'full'
  | 'no_correlation'
  | 'single_source_only'
  | 'no_ranking';

export interface VariantConfig {
  variant: RecommendationVariant;
  enableCorrelation: boolean;
  enableCrossSource: boolean;
  enableScoreRanking: boolean;
}

export const VARIANT_CONFIGS: Record<RecommendationVariant, VariantConfig> = {
  full: {
    variant: 'full',
    enableCorrelation: true,
    enableCrossSource: true,
    enableScoreRanking: true,
  },
  no_correlation: {
    variant: 'no_correlation',
    enableCorrelation: false,
    enableCrossSource: true,
    enableScoreRanking: true,
  },
  single_source_only: {
    variant: 'single_source_only',
    enableCorrelation: false,
    enableCrossSource: false,
    enableScoreRanking: true,
  },
  no_ranking: {
    variant: 'no_ranking',
    enableCorrelation: true,
    enableCrossSource: true,
    enableScoreRanking: false,
  },
};

export const VALID_VARIANTS: RecommendationVariant[] = [
  'full',
  'no_correlation',
  'single_source_only',
  'no_ranking',
];

export function getVariantConfig(variant: RecommendationVariant): VariantConfig {
  return VARIANT_CONFIGS[variant];
}

export function isValidVariant(value: string | undefined): value is RecommendationVariant {
  return VALID_VARIANTS.includes(value as RecommendationVariant);
}
