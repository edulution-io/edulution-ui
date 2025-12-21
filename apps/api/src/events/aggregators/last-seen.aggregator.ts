/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { buildUserLastSeenKey } from '@edulution/events';
import type { ProcessedEvent } from '@edulution/events';
import BaseAggregator from '../workers/base.aggregator';
import AggregationWorker from '../workers/aggregation.worker';

@Injectable()
class LastSeenAggregator extends BaseAggregator implements OnModuleInit, OnModuleDestroy {
  readonly name = 'LastSeenAggregator';

  constructor(private readonly worker: AggregationWorker) {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.initialize();
    this.worker.registerHandler(this);
  }

  async onModuleDestroy(): Promise<void> {
    await this.shutdown();
  }

  canHandle(event: ProcessedEvent): boolean {
    return !!event.event.user_id;
  }

  async handle(event: ProcessedEvent): Promise<void> {
    const redis = this.ensureRedis();
    const { user_id, source, occurred_at } = event.event;

    const key = buildUserLastSeenKey(user_id);

    const currentValue = await redis.hget(key, source);

    if (!currentValue || occurred_at > currentValue) {
      await redis.hset(key, source, occurred_at);
      this.logger.debug(`Updated last_seen for user ${user_id} source ${source}: ${occurred_at}`);
    }
  }
}

export default LastSeenAggregator;
