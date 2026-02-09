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

import { Body, Controller, Headers, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import WEBHOOK_API_ENDPOINT from '@libs/webhook/constants/webhookApiEndpoint';
import WEBHOOK_CONSTANTS from '@libs/webhook/constants/webhookConstants';
import Public from '../common/decorators/public.decorator';
import WebhookGuard from './webhook.guard';
import WebhookService from './webhook.service';

@Controller(WEBHOOK_API_ENDPOINT)
class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Public()
  @UseGuards(WebhookGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers(WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_EVENT_ID) eventId: string,
    @Headers('user-agent') userAgent: string,
    @Body() body: Record<string, unknown>,
  ): Promise<{ status: string }> {
    const serviceKey = WebhookController.extractServiceKey(userAgent);
    await this.webhookService.handleEvent(serviceKey, eventId, body);
    return { status: 'ok' };
  }

  private static extractServiceKey(userAgent: string): string {
    return userAgent.split('/')[0];
  }
}

export default WebhookController;
