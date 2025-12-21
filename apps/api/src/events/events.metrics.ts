/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, Logger } from '@nestjs/common';
import type { EventSource } from '@edulution/events';

export interface EventMetrics {
  ingested: number;
  failed: number;
  deduplicated: number;
  processed: number;
  dlqEntries: number;
  avgProcessingTimeMs: number;
}

export interface StreamMetrics {
  source: EventSource;
  length: number;
  pendingMessages: number;
  consumerCount: number;
  lastEntryId: string | null;
}

export interface AggregatorMetrics {
  name: string;
  eventsProcessed: number;
  errors: number;
  avgProcessingTimeMs: number;
}

export interface ObservabilitySnapshot {
  timestamp: string;
  events: EventMetrics;
  streams: StreamMetrics[];
  aggregators: AggregatorMetrics[];
  uptime: number;
}

@Injectable()
class EventsMetrics {
  private readonly logger = new Logger(EventsMetrics.name);

  private readonly startTime = Date.now();

  private counters = {
    ingested: 0,
    failed: 0,
    deduplicated: 0,
    processed: 0,
    dlqEntries: 0,
  };

  private processingTimes: number[] = [];

  private readonly maxSamples = 1000;

  private aggregatorStats: Map<
    string,
    { processed: number; errors: number; times: number[] }
  > = new Map();

  recordIngestion(success: boolean, deduplicated = false): void {
    if (success) {
      this.counters.ingested++;
      if (deduplicated) {
        this.counters.deduplicated++;
      }
    } else {
      this.counters.failed++;
    }
  }

  recordProcessing(durationMs: number): void {
    this.counters.processed++;
    this.processingTimes.push(durationMs);

    if (this.processingTimes.length > this.maxSamples) {
      this.processingTimes.shift();
    }
  }

  recordDlqEntry(): void {
    this.counters.dlqEntries++;
  }

  recordAggregatorProcessing(
    aggregatorName: string,
    durationMs: number,
    error = false,
  ): void {
    let stats = this.aggregatorStats.get(aggregatorName);
    if (!stats) {
      stats = { processed: 0, errors: 0, times: [] };
      this.aggregatorStats.set(aggregatorName, stats);
    }

    stats.processed++;
    if (error) {
      stats.errors++;
    }
    stats.times.push(durationMs);

    if (stats.times.length > this.maxSamples) {
      stats.times.shift();
    }
  }

  getEventMetrics(): EventMetrics {
    return {
      ingested: this.counters.ingested,
      failed: this.counters.failed,
      deduplicated: this.counters.deduplicated,
      processed: this.counters.processed,
      dlqEntries: this.counters.dlqEntries,
      avgProcessingTimeMs: this.calculateAverage(this.processingTimes),
    };
  }

  getAggregatorMetrics(): AggregatorMetrics[] {
    const results: AggregatorMetrics[] = [];

    for (const [name, stats] of this.aggregatorStats) {
      results.push({
        name,
        eventsProcessed: stats.processed,
        errors: stats.errors,
        avgProcessingTimeMs: this.calculateAverage(stats.times),
      });
    }

    return results;
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 100) / 100;
  }

  logMetricsSummary(): void {
    const metrics = this.getEventMetrics();
    this.logger.log(
      `Events - Ingested: ${metrics.ingested}, Failed: ${metrics.failed}, ` +
        `Processed: ${metrics.processed}, DLQ: ${metrics.dlqEntries}, ` +
        `Avg Time: ${metrics.avgProcessingTimeMs}ms`,
    );

    const aggregatorMetrics = this.getAggregatorMetrics();
    for (const agg of aggregatorMetrics) {
      this.logger.log(
        `Aggregator [${agg.name}] - Processed: ${agg.eventsProcessed}, ` +
          `Errors: ${agg.errors}, Avg Time: ${agg.avgProcessingTimeMs}ms`,
      );
    }
  }

  reset(): void {
    this.counters = {
      ingested: 0,
      failed: 0,
      deduplicated: 0,
      processed: 0,
      dlqEntries: 0,
    };
    this.processingTimes = [];
    this.aggregatorStats.clear();
  }
}

export default EventsMetrics;
