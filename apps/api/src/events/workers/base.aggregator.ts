/*
 * LICENSE PLACEHOLDER
 */

import { Logger } from '@nestjs/common';
import Redis from 'ioredis';
import type { ProcessedEvent } from '@edulution/events';
import type { AggregatorHandler } from './aggregation.worker';
import redisConnection from '../../common/redis.connection';

abstract class BaseAggregator implements AggregatorHandler {
  protected readonly logger: Logger;

  protected redis: Redis | null = null;

  abstract readonly name: string;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  async initialize(): Promise<void> {
    this.redis = new Redis({
      host: redisConnection.host,
      port: redisConnection.port,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    await this.redis.connect();
    this.logger.log(`${this.name} aggregator initialized`);
  }

  async shutdown(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  abstract canHandle(event: ProcessedEvent): boolean;

  abstract handle(event: ProcessedEvent): Promise<void>;

  protected ensureRedis(): Redis {
    if (!this.redis) {
      throw new Error('Redis not initialized');
    }
    return this.redis;
  }
}

export default BaseAggregator;
