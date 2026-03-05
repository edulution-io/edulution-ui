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

import type NotificationPreferencesDto from '@libs/user-preferences/types/notification-preferences.dto';
import isWithinSchedule from '@libs/user-preferences/utils/isWithinSchedule';

const shouldSendPush = (prefs: NotificationPreferencesDto | undefined, appId: string): boolean => {
  if (!prefs) {
    return true;
  }

  if (!prefs.pushEnabled) {
    return false;
  }

  const appPref = prefs.apps[appId];
  if (!appPref) {
    return true;
  }

  if (!appPref.enabled) {
    return false;
  }

  if (appPref.schedules?.length) {
    return appPref.schedules.some(isWithinSchedule);
  }

  return true;
};

export default shouldSendPush;
