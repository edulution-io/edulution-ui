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

import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import APP_DISPLAY_LOCATIONS from '@libs/appconfig/constants/appDisplayLocations';
import USER_PREFERENCES_FIELDS from '@libs/user-preferences/constants/user-preferences-fields';
import { NotificationIcon } from '@/assets/icons';
import PageLayout from '@/components/structure/layout/PageLayout';
import { SectionAccordion, SectionAccordionItem } from '@/components/ui/SectionAccordion';
import Switch from '@/components/ui/Switch';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useUserPreferencesStore from '@/store/useUserPreferencesStore';
import NotificationScheduleCalendar from '@/pages/UserSettings/Notifications/components/NotificationScheduleCalendar';

const NotificationsSettingsPage = () => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const { notificationPreferences, getUserPreferences, updateNotificationPreferences } = useUserPreferencesStore();

  useEffect(() => {
    void getUserPreferences([USER_PREFERENCES_FIELDS.notifications]);
  }, []);

  const userApps = useMemo(
    () => appConfigs.filter((config) => config.displayLocations?.includes(APP_DISPLAY_LOCATIONS.SIDEBAR)),
    [appConfigs],
  );

  const handlePushToggle = (enabled: boolean) => {
    void updateNotificationPreferences({ pushEnabled: enabled });
  };

  const switchId = 'push-notifications-switch';

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('usersettings.notifications.title'),
        description: t('usersettings.notifications.description'),
        iconSrc: NotificationIcon,
      }}
    >
      <SectionAccordion defaultOpenAll>
        <SectionAccordionItem
          id="push-notifications"
          label={t('usersettings.notifications.pushNotifications')}
        >
          <div className="flex items-center justify-between">
            <label
              htmlFor={switchId}
              className="cursor-pointer text-background"
            >
              {t('usersettings.notifications.pushNotificationsDescription')}
            </label>
            <Switch
              id={switchId}
              checked={notificationPreferences.pushEnabled}
              onCheckedChange={handlePushToggle}
            />
          </div>
        </SectionAccordionItem>
        <SectionAccordionItem
          id="app-notifications"
          label={t('usersettings.notifications.appNotifications')}
        >
          <p className="mb-4 text-background">{t('usersettings.notifications.appNotificationsDescription')}</p>
          <NotificationScheduleCalendar apps={userApps} />
        </SectionAccordionItem>
      </SectionAccordion>
    </PageLayout>
  );
};

export default NotificationsSettingsPage;
