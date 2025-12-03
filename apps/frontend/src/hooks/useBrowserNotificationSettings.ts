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

import { useCallback, useEffect, useState } from 'react';
import BROWSER_NOTIFICATION_PERMISSION from '@libs/notification/constants/browserNotificationPermission';

const STORAGE_KEY = 'browser-notifications-enabled';

const getInitialPermission = (): NotificationPermission => {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return BROWSER_NOTIFICATION_PERMISSION.DENIED;
  }
  return Notification.permission;
};

const getInitialEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored === 'true') return true;
    if (stored === 'false') return false;

    if (typeof Notification !== 'undefined') {
      return Notification.permission === BROWSER_NOTIFICATION_PERMISSION.GRANTED;
    }

    return false;
  } catch {
    return false;
  }
};

const useBrowserNotificationSettings = () => {
  const [permission, setPermission] = useState<NotificationPermission>(getInitialPermission);
  const [isEnabled, setIsEnabled] = useState<boolean>(getInitialEnabled);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    setPermission(Notification.permission);
  }, []);

  const enable = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      return BROWSER_NOTIFICATION_PERMISSION.DENIED;
    }

    let result: NotificationPermission = Notification.permission;

    if (result === BROWSER_NOTIFICATION_PERMISSION.DEFAULT) {
      result = await Notification.requestPermission();
    }

    setPermission(result);

    if (result === BROWSER_NOTIFICATION_PERMISSION.GRANTED) {
      window.localStorage.setItem(STORAGE_KEY, 'true');
      setIsEnabled(true);
    }

    return result;
  }, []);

  const disable = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'false');
    }
    setIsEnabled(false);
  }, []);

  const toggle = useCallback(async () => {
    if (isEnabled) {
      disable();
    } else {
      await enable();
    }
  }, [isEnabled, enable, disable]);

  const isGranted = permission === BROWSER_NOTIFICATION_PERMISSION.GRANTED;
  const isDenied = permission === BROWSER_NOTIFICATION_PERMISSION.DENIED;
  const isDefault = permission === BROWSER_NOTIFICATION_PERMISSION.DEFAULT;

  const isActive = isGranted && isEnabled;

  return {
    permission,
    isEnabled,
    isActive,
    isGranted,
    isDenied,
    isDefault,
    enable,
    disable,
    toggle,
  };
};

export default useBrowserNotificationSettings;
