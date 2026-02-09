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

import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { Request } from 'express';
import WEBHOOK_CONSTANTS from '@libs/webhook/constants/webhookConstants';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import WEBHOOK_ERROR_MESSAGES from '@libs/webhook/constants/webhookErrorMessages';
import CustomHttpException from '../common/CustomHttpException';

@Injectable()
class WebhookGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const { headers } = request;

    const key = headers[WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_KEY] as string;
    const timestamp = headers[WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_TIMESTAMP] as string;
    const signature = headers[WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_SIGNATURE] as string;
    const eventId = headers[WEBHOOK_CONSTANTS.HEADERS.WEBHOOK_EVENT_ID] as string;
    const userAgent = (headers[HTTP_HEADERS.UserAgent] as string) ?? '';

    if (!key || !timestamp || !signature || !eventId) {
      throw new CustomHttpException(
        WEBHOOK_ERROR_MESSAGES.MISSING_HEADERS,
        HttpStatus.BAD_REQUEST,
        undefined,
        WebhookGuard.name,
      );
    }

    if (key !== process.env.WEBHOOK_SECRET_KEY) {
      throw new CustomHttpException(
        WEBHOOK_ERROR_MESSAGES.INVALID_KEY,
        HttpStatus.UNAUTHORIZED,
        undefined,
        WebhookGuard.name,
      );
    }

    const timestampMs = Number(timestamp) * 1000;
    const age = Date.now() - timestampMs;
    if (Number.isNaN(timestampMs) || age > WEBHOOK_CONSTANTS.TIMESTAMP_MAX_AGE_MS || age < 0) {
      throw new CustomHttpException(
        WEBHOOK_ERROR_MESSAGES.TIMESTAMP_EXPIRED,
        HttpStatus.UNAUTHORIZED,
        undefined,
        WebhookGuard.name,
      );
    }

    const rawBody = request.rawBody ?? Buffer.alloc(0);
    const expectedSignature = createHmac('sha256', process.env.WEBHOOK_SECRET_KEY ?? '')
      .update(`${timestamp}.${rawBody.toString('utf8')}`)
      .digest('hex');

    const receivedHex = signature.startsWith(WEBHOOK_CONSTANTS.SIGNATURE_PREFIX)
      ? signature.slice(WEBHOOK_CONSTANTS.SIGNATURE_PREFIX.length)
      : signature;

    const sigBuffer = Buffer.from(receivedHex, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      throw new CustomHttpException(
        WEBHOOK_ERROR_MESSAGES.INVALID_SIGNATURE,
        HttpStatus.UNAUTHORIZED,
        undefined,
        WebhookGuard.name,
      );
    }

    const isKnownAgent = Object.values(WEBHOOK_CONSTANTS.USER_AGENTS).some((agent) => userAgent.startsWith(agent));
    if (!isKnownAgent) {
      throw new CustomHttpException(
        WEBHOOK_ERROR_MESSAGES.INVALID_USER_AGENT,
        HttpStatus.BAD_REQUEST,
        undefined,
        WebhookGuard.name,
      );
    }

    return true;
  }
}

export default WebhookGuard;
