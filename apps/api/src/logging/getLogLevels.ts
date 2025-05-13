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

import { LogLevel } from '@nestjs/common';
import LOG_LEVELS from './log-levels';

const getLogLevels = (envValue: string | undefined): LogLevel[] | false => {
  const allLevels: LogLevel[] = Object.values(LOG_LEVELS);
  const fallBackLevels = [LOG_LEVELS.ERROR, LOG_LEVELS.WARN, LOG_LEVELS.LOG];
  if (!envValue) {
    return process.env.NODE_ENV === 'production' ? fallBackLevels : allLevels;
  }

  if (envValue === 'off') {
    return false;
  }

  const level = envValue.trim().toLowerCase() as LogLevel;
  const index = allLevels.indexOf(level);

  if (index === -1) {
    return fallBackLevels;
  }

  return allLevels.slice(0, index + 1);
};

export default getLogLevels;
