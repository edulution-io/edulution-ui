/*
 * LICENSE PLACEHOLDER
 */

import { Injectable } from '@nestjs/common';

interface DailyPlanMetrics {
  generation_total: number;
  generation_success: number;
  generation_errors: number;
  cache_hits: number;
  cache_misses: number;
  validation_failures: number;
  safety_violations: number;
  avg_latency_ms: number;
}

@Injectable()
class DailyPlanMetricsService {
  private generationTotal = 0;

  private generationSuccess = 0;

  private generationErrors = 0;

  private cacheHits = 0;

  private cacheMisses = 0;

  private validationFailures = 0;

  private safetyViolations = 0;

  private totalLatencyMs = 0;

  recordGeneration(latencyMs: number, success: boolean, cached: boolean): void {
    this.generationTotal++;
    this.totalLatencyMs += latencyMs;

    if (cached) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }

    if (success) {
      this.generationSuccess++;
    } else {
      this.generationErrors++;
    }
  }

  recordValidationFailure(): void {
    this.validationFailures++;
  }

  recordSafetyViolation(): void {
    this.safetyViolations++;
  }

  getMetrics(): DailyPlanMetrics {
    return {
      generation_total: this.generationTotal,
      generation_success: this.generationSuccess,
      generation_errors: this.generationErrors,
      cache_hits: this.cacheHits,
      cache_misses: this.cacheMisses,
      validation_failures: this.validationFailures,
      safety_violations: this.safetyViolations,
      avg_latency_ms:
        this.generationTotal > 0 ? Math.round(this.totalLatencyMs / this.generationTotal) : 0,
    };
  }

  reset(): void {
    this.generationTotal = 0;
    this.generationSuccess = 0;
    this.generationErrors = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.validationFailures = 0;
    this.safetyViolations = 0;
    this.totalLatencyMs = 0;
  }
}

export default DailyPlanMetricsService;
export type { DailyPlanMetrics };
