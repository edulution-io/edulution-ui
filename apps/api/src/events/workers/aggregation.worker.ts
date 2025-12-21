/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import {
  StreamConsumer,
  EVENT_SOURCES,
  ProcessedEvent,
  ProcessResult,
} from '@edulution/events';
import type { EventSource } from '@edulution/events';
import redisConnection from '../../common/redis.connection';

export interface AggregatorHandler {
  name: string;
  canHandle: (event: ProcessedEvent) => boolean;
  handle: (event: ProcessedEvent) => Promise<void>;
}

@Injectable()
class AggregationWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AggregationWorker.name);

  private consumer: StreamConsumer | null = null;

  private readonly handlers: AggregatorHandler[] = [];

  private readonly enabled: boolean;

  constructor() {
    this.enabled = process.env.EVENTS_WORKER_ENABLED !== 'false';
  }

  registerHandler(handler: AggregatorHandler): void {
    this.handlers.push(handler);
    this.logger.log(`Registered aggregator handler: ${handler.name}`);
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled) {
      this.logger.log('Aggregation worker is disabled');
      return;
    }

    try {
      const sources = Object.values(EVENT_SOURCES) as EventSource[];

      this.consumer = new StreamConsumer({
        host: redisConnection.host,
        port: redisConnection.port,
        sources,
        consumerName: `api-worker-${process.pid}`,
      });

      this.consumer.onMessage(this.processEvent.bind(this));

      await this.consumer.connect();

      this.startWorker();

      this.logger.log('Aggregation worker initialized');
    } catch (error) {
      this.logger.error('Failed to initialize aggregation worker', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.consumer) {
      this.consumer.stop();
      await this.consumer.disconnect();
      this.logger.log('Aggregation worker stopped');
    }
  }

  private startWorker(): void {
    if (!this.consumer) return;

    this.consumer.start().catch((error) => {
      this.logger.error('Aggregation worker error', error);
    });
  }

  private async processEvent(event: ProcessedEvent): Promise<ProcessResult> {
    const applicableHandlers = this.handlers.filter((h) => h.canHandle(event));

    if (applicableHandlers.length === 0) {
      return { success: true };
    }

    const errors: Error[] = [];

    for (const handler of applicableHandlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        this.logger.error(`Handler ${handler.name} failed for event ${event.event.event_id}`, error);
        errors.push(error as Error);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: new Error(`${errors.length} handler(s) failed: ${errors.map((e) => e.message).join('; ')}`),
      };
    }

    return { success: true };
  }

  getStats(): { processed: number; errors: number; dlq: number; handlers: number } {
    const consumerStats = this.consumer?.getStats() || { processed: 0, errors: 0, dlq: 0 };
    return {
      ...consumerStats,
      handlers: this.handlers.length,
    };
  }

  isRunning(): boolean {
    return this.consumer?.isRunning() || false;
  }
}

export default AggregationWorker;
