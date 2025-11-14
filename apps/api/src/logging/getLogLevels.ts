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

import { LogLevel } from '@nestjs/common';
import LOG_LEVELS from './log-levels';

const getLogLevels = (envValue: string | undefined): LogLevel[] | undefined => {
  const allLevels: LogLevel[] = Object.values(LOG_LEVELS);
  const fallBackLevels = [LOG_LEVELS.ERROR, LOG_LEVELS.WARN, LOG_LEVELS.LOG];
  if (!envValue) {
    return process.env.NODE_ENV === 'production' ? fallBackLevels : allLevels;
  }

  if (envValue === 'off') {
    return undefined;
  }

  const level = envValue.trim().toLowerCase() as LogLevel;
  const index = allLevels.indexOf(level);

  if (index === -1) {
    return fallBackLevels;
  }

  return allLevels.slice(0, index + 1);
};

export default getLogLevels;
