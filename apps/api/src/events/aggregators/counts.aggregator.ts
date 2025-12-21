/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { buildUserCounts1hKey, buildUserCounts24hKey, TTL_CONFIG } from '@edulution/events';
import type { ProcessedEvent } from '@edulution/events';
import BaseAggregator from '../workers/base.aggregator';
import AggregationWorker from '../workers/aggregation.worker';

@Injectable()
class CountsAggregator extends BaseAggregator implements OnModuleInit, OnModuleDestroy {
  readonly name = 'CountsAggregator';

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
    return !!event.event.user_id && !!event.event.type;
  }

  async handle(event: ProcessedEvent): Promise<void> {
    const redis = this.ensureRedis();
    const { user_id, type } = event.event;

    const key1h = buildUserCounts1hKey(user_id);
    const key24h = buildUserCounts24hKey(user_id);

    const pipeline = redis.pipeline();

    pipeline.hincrby(key1h, type, 1);
    pipeline.expire(key1h, TTL_CONFIG.COUNTS_1H_TTL_SECONDS);

    pipeline.hincrby(key24h, type, 1);
    pipeline.expire(key24h, TTL_CONFIG.COUNTS_24H_TTL_SECONDS);

    await pipeline.exec();

    this.logger.debug(`Incremented counts for user ${user_id} type ${type}`);
  }
}

export default CountsAggregator;
