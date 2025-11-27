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

import { APP_FILTER } from '@nestjs/core';
import { DynamicModule, Logger } from '@nestjs/common';
import { init as sentryInit } from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { SentryModule, SentryGlobalFilter } from '@sentry/nestjs/setup';
import configuration from '../config/configuration';

const enableSentryForNest = (): DynamicModule[] => {
  const enable = process.env.ENABLE_SENTRY?.toLowerCase() === 'true';
  const dsn = process.env.SENTRY_EDU_API_DSN;

  if (!enable || !dsn) {
    Logger.debug('Disabled (no DSN set)', 'Sentry');
    return [];
  }

  const config = configuration();
  const version = config.version ?? 'unknown';

  sentryInit({
    dsn,
    sendDefaultPii: true,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    environment: process.env.EDULUTION_BASE_DOMAIN ?? 'localhost',
    release: `edulution-api@${version}`,
  });

  Logger.debug('Initialized ✅', 'Sentry');

  return [
    SentryModule.forRoot(),
    {
      module: class SentryDynamicProvider {},
      providers: [
        {
          provide: APP_FILTER,
          useClass: SentryGlobalFilter,
        },
      ],
    },
  ];
};

export default enableSentryForNest;
