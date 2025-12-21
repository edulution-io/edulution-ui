/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import {
  EventPublisher,
  EventBuilder,
  validateEventInput,
  ValidationError,
  EVENT_SOURCES,
  CONSUMER_GROUPS,
} from '@edulution/events';
import type { Event, EventInput, EventSource, PublishResult, PipelineHealth, DLQStats } from '@edulution/events';
import redisConnection from '../common/redis.connection';

export interface IngestResult {
  success: boolean;
  eventId?: string;
  streamId?: string;
  deduplicated?: boolean;
  error?: string;
}

export interface IngestOptions {
  idempotencyKey?: string;
}

export interface IngestManyResult {
  total: number;
  successful: number;
  deduplicated: number;
  failed: number;
  results: IngestResult[];
}

@Injectable()
class EventsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsService.name);

  private publisher: EventPublisher;

  private initialized = false;

  constructor() {
    this.publisher = new EventPublisher({
      host: redisConnection.host,
      port: redisConnection.port,
    });
  }

  async onModuleInit() {
    try {
      await this.publisher.connect();
      await this.initializeConsumerGroups();
      this.initialized = true;
      this.logger.log('EventsService initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize EventsService', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.publisher.disconnect();
      this.logger.log('EventsService disconnected');
    } catch (error) {
      this.logger.error('Failed to disconnect EventsService', error);
    }
  }

  private async initializeConsumerGroups() {
    const sources = Object.values(EVENT_SOURCES);

    for (const source of sources) {
      try {
        const created = await this.publisher.createConsumerGroup(
          source as EventSource,
          CONSUMER_GROUPS.AGGREGATORS,
        );
        if (created) {
          this.logger.log(`Created consumer group '${CONSUMER_GROUPS.AGGREGATORS}' for stream '${source}'`);
        }
      } catch (error) {
        this.logger.warn(`Could not create consumer group for ${source}: ${(error as Error).message}`);
      }
    }
  }

  isReady(): boolean {
    return this.initialized && this.publisher.isReady();
  }

  async ingest(input: EventInput, options: IngestOptions = {}): Promise<IngestResult> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Events service not ready',
      };
    }

    try {
      const validatedInput = validateEventInput(input);

      const event = EventBuilder.fromInput(validatedInput as EventInput).build();

      const result = await this.publisher.publish(event, {
        idempotencyKey: options.idempotencyKey,
      });

      if (!result.success) {
        return {
          success: false,
          eventId: result.eventId,
          error: result.error?.message || 'Unknown error',
        };
      }

      return {
        success: true,
        eventId: result.eventId,
        streamId: result.streamId,
        deduplicated: result.deduplicated,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: `Validation error: ${error.message}`,
        };
      }

      this.logger.error('Failed to ingest event', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async ingestMany(inputs: EventInput[]): Promise<IngestManyResult> {
    const results: IngestResult[] = [];
    let successful = 0;
    let deduplicated = 0;
    let failed = 0;

    for (const input of inputs) {
      const result = await this.ingest(input);
      results.push(result);

      if (result.success) {
        if (result.deduplicated) {
          deduplicated++;
        } else {
          successful++;
        }
      } else {
        failed++;
      }
    }

    return {
      total: inputs.length,
      successful,
      deduplicated,
      failed,
      results,
    };
  }

  async publish(event: Event): Promise<PublishResult> {
    if (!this.isReady()) {
      return {
        success: false,
        eventId: event.event_id,
        error: new Error('Events service not ready'),
      };
    }

    return this.publisher.publish(event);
  }

  async publishMany(events: Event[]): Promise<PublishResult[]> {
    if (!this.isReady()) {
      return events.map((e) => ({
        success: false,
        eventId: e.event_id,
        error: new Error('Events service not ready'),
      }));
    }

    return this.publisher.publishBatch(events);
  }

  async getHealth(): Promise<PipelineHealth> {
    if (!this.isReady()) {
      return {
        status: 'unhealthy',
        streams: {},
        dlq: {},
        last_checked: new Date().toISOString(),
      };
    }

    const sources = Object.values(EVENT_SOURCES) as EventSource[];
    const streams: PipelineHealth['streams'] = {};
    const dlq: PipelineHealth['dlq'] = {};
    let hasErrors = false;

    for (const source of sources) {
      try {
        const info = await this.publisher.getStreamInfo(source);
        streams[source] = {
          length: info.length,
          pending: 0,
          consumers: 0,
          last_entry_id: info.lastEntryId,
        };
      } catch (error) {
        hasErrors = true;
        streams[source] = {
          length: 0,
          pending: 0,
          consumers: 0,
          last_entry_id: null,
        };
      }

      dlq[source] = { length: 0 };
    }

    return {
      status: hasErrors ? 'degraded' : 'healthy',
      streams,
      dlq,
      last_checked: new Date().toISOString(),
    };
  }

  async getDlqStats(): Promise<DLQStats> {
    return {
      total_entries: 0,
      by_source: {},
      by_failure_reason: {},
      oldest_entry: null,
      newest_entry: null,
    };
  }
}

export default EventsService;
