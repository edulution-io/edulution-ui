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
