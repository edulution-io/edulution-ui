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

import { t } from 'i18next';

const formatEstimatedTimeRemaining = (seconds?: number): string => {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) {
    return '–';
  }

  const totalSeconds = Math.round(seconds);

  if (totalSeconds < 5) {
    return t('filesharing.eta.fewSeconds');
  }
  if (totalSeconds < 60) {
    return t('filesharing.eta.lessThanMinute');
  }
  if (totalSeconds < 90) {
    return t('filesharing.eta.aboutOneMinute');
  }

  const totalMinutes = Math.round(totalSeconds / 60);
  if (totalSeconds < 3600) {
    return t('filesharing.eta.aboutMinutes', { count: totalMinutes });
  }

  const wholeHours = Math.floor(totalSeconds / 3600);
  const minutesRemainder = Math.floor((totalSeconds % 3600) / 60);

  if (wholeHours < 24) {
    if (minutesRemainder <= 5) {
      return t('filesharing.eta.aboutHours', { count: wholeHours });
    }
    return t('filesharing.eta.moreThanHours', { count: wholeHours });
  }

  const wholeDays = Math.floor(totalSeconds / 86400);
  const hoursRemainder = Math.floor((totalSeconds % 86400) / 3600);

  if (hoursRemainder <= 6) {
    return t('filesharing.eta.aboutDays', { count: wholeDays });
  }
  return t('filesharing.eta.moreThanDays', { count: wholeDays });
};

export default formatEstimatedTimeRemaining;
