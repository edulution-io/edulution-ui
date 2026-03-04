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

import React, { useState, useMemo } from 'react';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import type NotificationScheduleDto from '@libs/user-preferences/types/notification-schedule.dto';
import APP_NOTIFICATIONS_TABLE_COLUMNS from '@libs/user-preferences/constants/appNotificationsTableColumns';
import APPS from '@libs/appconfig/constants/apps';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import getDisplayName from '@/utils/getDisplayName';
import useLanguage from '@/hooks/useLanguage';
import useOrganizationType from '@/hooks/useOrganizationType';
import useUserPreferencesStore from '@/store/useUserPreferencesStore';
import NotificationScheduleDialog from '@/pages/UserSettings/Notifications/components/NotificationScheduleDialog';
import AppNotificationsTableColumns, {
  AppNotificationRow,
} from '@/pages/UserSettings/Notifications/components/appNotificationsTableColumns';

interface AppNotificationsListProps {
  apps: AppConfigDto[];
  appNotifications: Record<string, boolean>;
  appSchedules: Record<string, NotificationScheduleDto | undefined>;
}

const AppNotificationsList: React.FC<AppNotificationsListProps> = ({ apps, appNotifications, appSchedules }) => {
  const { language } = useLanguage();
  const { isSchoolEnvironment } = useOrganizationType();
  const { updateNotificationPreferences } = useUserPreferencesStore();
  const [scheduleDialogApp, setScheduleDialogApp] = useState<string | null>(null);

  const tableData: AppNotificationRow[] = useMemo(
    () =>
      apps.map((cfg) => ({
        name: cfg.name,
        icon: cfg.icon,
        displayName: getDisplayName(cfg, language, isSchoolEnvironment),
        enabled: appNotifications[cfg.name] ?? true,
        schedule: appSchedules[cfg.name],
      })),
    [apps, appNotifications, appSchedules, language, isSchoolEnvironment],
  );

  const dialogApp = apps.find((cfg) => cfg.name === scheduleDialogApp);

  const handleScheduleSave = (schedule: NotificationScheduleDto) => {
    if (!dialogApp) return;
    void updateNotificationPreferences({ appName: dialogApp.name, appSchedule: schedule });
  };

  return (
    <>
      <ScrollableTable
        columns={AppNotificationsTableColumns}
        data={tableData}
        filterKey={APP_NOTIFICATIONS_TABLE_COLUMNS.APP}
        filterPlaceHolderText=""
        applicationName={APPS.SETTINGS}
        showSearchBarAndColumnSelect={false}
        showSelectedCount={false}
        showHeader
        onRowClick={(row) => setScheduleDialogApp(row.name)}
      />
      {dialogApp && (
        <NotificationScheduleDialog
          appDisplayName={getDisplayName(dialogApp, language, isSchoolEnvironment)}
          currentSchedule={appSchedules[dialogApp.name]}
          isOpen={scheduleDialogApp !== null}
          onClose={() => setScheduleDialogApp(null)}
          onSave={handleScheduleSave}
        />
      )}
    </>
  );
};

export default AppNotificationsList;
