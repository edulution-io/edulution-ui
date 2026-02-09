/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { HttpStatus, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import IORedis from 'ioredis';
import WEBHOOK_CONSTANTS from '@libs/webhook/constants/webhookConstants';
import WEBHOOK_ERROR_MESSAGES from '@libs/webhook/constants/webhookErrorMessages';
import redisConnection from '../common/redis.connection';
import CustomHttpException from '../common/CustomHttpException';

@Injectable()
class WebhookService implements OnModuleInit, OnModuleDestroy {
  private redis!: IORedis;

  private readonly processedEvents = new Map<string, true>();

  onModuleInit() {
    this.redis = new IORedis(redisConnection);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async handleEvent(serviceKey: string, eventId: string, body: Record<string, unknown>): Promise<void> {
    if (this.processedEvents.has(eventId)) {
      throw new CustomHttpException(
        WEBHOOK_ERROR_MESSAGES.DUPLICATE_EVENT,
        HttpStatus.CONFLICT,
        eventId,
        WebhookService.name,
      );
    }

    this.markProcessed(eventId);

    switch (serviceKey) {
      case WEBHOOK_CONSTANTS.USER_AGENTS.EVENTHANDLER:
        await this.handleEventhandlerEvent(body);
        break;
      default:
        Logger.warn(`Unknown service key: ${serviceKey}`, WebhookService.name);
    }
  }

  private markProcessed(eventId: string): void {
    this.processedEvents.set(eventId, true);
    if (this.processedEvents.size > WEBHOOK_CONSTANTS.MAX_PROCESSED_EVENTS) {
      const oldest = this.processedEvents.keys().next().value as string;
      this.processedEvents.delete(oldest);
    }
  }

  private async handleEventhandlerEvent(body: Record<string, unknown>): Promise<void> {
    const username = body.username as string | undefined;
    if (!username) {
      return;
    }

    const key = `${WEBHOOK_CONSTANTS.REDIS_KEYS.EVENTHANDLER_PREFIX}:${username}`;
    await this.redis.set(key, JSON.stringify(body), 'EX', WEBHOOK_CONSTANTS.EVENT_TTL_SECONDS);
    Logger.log(`Stored event for user ${username}`, WebhookService.name);
  }
}

export default WebhookService;
