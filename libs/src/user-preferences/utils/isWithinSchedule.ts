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

import type NotificationScheduleDto from '@libs/user-preferences/types/notification-schedule.dto';
import toWeekday from '@libs/user-preferences/utils/toWeekday';

const isWithinSchedule = (schedule: NotificationScheduleDto): boolean => {
  if (!schedule.enabled) {
    return true;
  }

  const now = new Date();
  const currentDay = toWeekday(now.getDay());

  if (!schedule.days.includes(currentDay)) {
    return false;
  }

  if (schedule.startTime && schedule.endTime) {
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return currentTime >= schedule.startTime && currentTime <= schedule.endTime;
  }

  return true;
};

export default isWithinSchedule;
