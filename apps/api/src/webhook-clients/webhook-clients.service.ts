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

import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import WEBHOOK_CONSTANTS from '@libs/webhook/constants/webhookConstants';
import WEBHOOK_ERROR_MESSAGES from '@libs/webhook/constants/webhookErrorMessages';
import type WebhookClientDto from '@libs/webhook/types/webhookClientDto';
import CustomHttpException from '../common/CustomHttpException';
import { WebhookClient } from './webhook-client.schema';

@Injectable()
class WebhookClientsService implements OnModuleInit {
  private webhookClientsMap = new Map<string, string>();

  constructor(@InjectModel(WebhookClient.name) private readonly webhookClientModel: Model<WebhookClient>) {}

  async onModuleInit() {
    await this.loadCache();
  }

  async loadCache(): Promise<void> {
    try {
      const clients = await this.webhookClientModel.find({}).lean();
      const newMap = new Map<string, string>();
      clients.forEach((client) => {
        newMap.set(client.apiKey, client.userAgent);
      });
      this.webhookClientsMap = newMap;
      Logger.verbose(`Webhook clients cache loaded with ${newMap.size} entries`, WebhookClientsService.name);
    } catch (error) {
      throw new CustomHttpException(
        WEBHOOK_ERROR_MESSAGES.WEBHOOK_CLIENTS,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WebhookClientsService.name,
      );
    }
  }

  isValidClient(apiKey: string, userAgent: string): boolean {
    const cachedAgent = this.webhookClientsMap.get(apiKey);
    if (!cachedAgent) return false;
    return userAgent.startsWith(cachedAgent);
  }

  async getAll(): Promise<WebhookClientDto[]> {
    const clients = await this.webhookClientModel.find({});
    return clients.map((client) => ({
      id: client.id as string,
      userAgent: client.userAgent,
      apiKey: client.apiKey,
      createdAt: client.createdAt?.toISOString(),
    }));
  }

  async create(userAgent: string): Promise<WebhookClientDto> {
    const apiKey = randomBytes(WEBHOOK_CONSTANTS.API_KEY_LENGTH).toString('hex');
    const client = await this.webhookClientModel.create({ userAgent, apiKey });
    await this.loadCache();
    Logger.log(`Webhook client created for ${userAgent}`, WebhookClientsService.name);
    return {
      id: client.id as string,
      userAgent: client.userAgent,
      apiKey: client.apiKey,
      createdAt: client.createdAt?.toISOString(),
    };
  }

  async delete(id: string): Promise<void> {
    await this.webhookClientModel.findByIdAndDelete(id);
    await this.loadCache();
    Logger.log(`Webhook client ${id} deleted`, WebhookClientsService.name);
  }
}

export default WebhookClientsService;
