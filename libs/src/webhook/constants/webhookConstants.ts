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

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const TWENTY_FOUR_HOURS_SECONDS = 86400;

const WEBHOOK_CONSTANTS = {
  HEADERS: {
    WEBHOOK_KEY: 'x-webhook-key',
    WEBHOOK_TIMESTAMP: 'x-webhook-timestamp',
    WEBHOOK_SIGNATURE: 'x-webhook-signature',
    WEBHOOK_EVENT_ID: 'x-webhook-event-id',
  },
  USER_AGENTS: {
    EVENTHANDLER: 'edulution-eventhandler',
  },
  REDIS_KEYS: {
    EVENTHANDLER_PREFIX: 'eventhandler',
  },
  TIMESTAMP_MAX_AGE_MS: FIVE_MINUTES_MS,
  MAX_PROCESSED_EVENTS: 100,
  EVENT_TTL_SECONDS: TWENTY_FOUR_HOURS_SECONDS,
  SIGNATURE_PREFIX: 'sha256=',
} as const;

export default WEBHOOK_CONSTANTS;
