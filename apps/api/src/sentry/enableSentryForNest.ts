/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { APP_FILTER } from '@nestjs/core';
import { DynamicModule, Logger } from '@nestjs/common';
import { init as sentryInit } from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { SentryModule, SentryGlobalFilter } from '@sentry/nestjs/setup';
import configuration from '../config/configuration';

const enableSentryForNest = (): DynamicModule[] => {
  const enable = process.env.ENABLE_SENTRY === 'true';
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
