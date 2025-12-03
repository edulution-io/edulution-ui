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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BellIcon, BellOffIcon, BellRingIcon } from 'lucide-react';
import useBrowserNotificationSettings from '@/hooks/useBrowserNotificationSettings';
import IconCircle from '@/components/ui/IconCircle';
import StatusBadge from '@/components/ui/StatusBadge';
import SettingsCard from '@/components/SettingsCard';

const BrowserNotificationSettings: React.FC = () => {
  const { t } = useTranslation();
  const { isGranted, isDenied, isDefault, enable } = useBrowserNotificationSettings();

  const getVariant = () => {
    if (isGranted) return 'success';
    if (isDenied) return 'error';
    return 'default';
  };

  const getIcon = () => {
    if (isGranted) return <BellRingIcon className="h-6 w-6" />;
    if (isDenied) return <BellOffIcon className="h-6 w-6" />;
    return <BellIcon className="h-6 w-6" />;
  };

  return (
    <SettingsCard
      icon={<IconCircle variant={getVariant()}>{getIcon()}</IconCircle>}
      title={t('usersettings.notifications.browserNotifications')}
      description={t('usersettings.notifications.browserNotificationsInfo')}
    >
      {isDefault && (
        <button
          onClick={enable}
          type="button"
          className="hover:bg-primary/80 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          {t('usersettings.notifications.requestPermission')}
        </button>
      )}

      {isDenied && (
        <div className="space-y-2">
          <StatusBadge variant="error">{t('usersettings.config.disabled')}</StatusBadge>
          <p className="text-sm text-ciLightGrey">{t('usersettings.notifications.enableInBrowserSettings')}</p>
        </div>
      )}

      {isGranted && <StatusBadge variant="success">{t('usersettings.config.enabled')}</StatusBadge>}
    </SettingsCard>
  );
};

export default BrowserNotificationSettings;
