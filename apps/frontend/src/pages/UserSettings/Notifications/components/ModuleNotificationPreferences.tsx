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

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import Switch from '@/components/ui/Switch';
import AvailableNotificationModules from '@/pages/UserSettings/Notifications/availableNotificationModules';
import { TABLE_ICON_SIZE } from '@libs/ui/constants';
import TApps from '@libs/appconfig/types/appsType';
import useNotificationSettingsStore from '@/pages/UserSettings/Notifications/useNotificationSettingsStore';

const ModuleNotificationPreferences: React.FC = () => {
  const { t } = useTranslation();
  const { notificationSettings, isLoading, getNotificationSettings, updateNotificationSettings } =
    useNotificationSettingsStore();

  const [moduleSettings, setModuleSettings] = useState<Record<string, boolean>>(() =>
    AvailableNotificationModules.reduce((acc, module) => ({ ...acc, [module.id]: true }), {}),
  );

  useEffect(() => {
    void getNotificationSettings();
  }, []);

  useEffect(() => {
    if (notificationSettings) {
      const modulePrefs = notificationSettings.modulePreferences || {};
      const hasAnyPreference = Object.keys(modulePrefs).length > 0;

      const newSettings = AvailableNotificationModules.reduce(
        (acc, module) => ({
          ...acc,
          [module.id]: hasAnyPreference ? (modulePrefs[module.id as TApps] ?? true) : true,
        }),
        {},
      );
      setModuleSettings(newSettings);
    }
  }, [notificationSettings]);

  // Nicht anzeigen wenn Push-Notifications deaktiviert sind
  if (notificationSettings && !notificationSettings.pushEnabled) {
    return <div className="my-4 text-gray-400">{t('usersettings.notifications.enablePushFirst')}</div>;
  }

  const getStoredValue = (moduleId: string): boolean => {
    if (!notificationSettings) return true;

    const modulePrefs = notificationSettings.modulePreferences || {};
    const hasAnyPreference = Object.keys(modulePrefs).length > 0;

    if (!hasAnyPreference) return true;

    return modulePrefs[moduleId as TApps] ?? true;
  };

  const hasChanges = AvailableNotificationModules.some(
    (module) => moduleSettings[module.id] !== getStoredValue(module.id),
  );

  const handleToggle = (moduleId: string, checked: boolean) => {
    setModuleSettings((prev) => ({ ...prev, [moduleId]: checked }));
  };

  const handleToggleAll = (checked: boolean) => {
    setModuleSettings(AvailableNotificationModules.reduce((acc, module) => ({ ...acc, [module.id]: checked }), {}));
  };

  const allEnabled = AvailableNotificationModules.every((module) => moduleSettings[module.id]);

  const handleSave = async () => {
    if (!notificationSettings) return;

    const allModulePreferences = Object.entries(moduleSettings).reduce(
      (acc, [moduleId, enabled]) => ({
        ...acc,
        [moduleId]: enabled,
      }),
      {} as Partial<Record<TApps, boolean>>,
    );

    await updateNotificationSettings({
      ...notificationSettings,
      modulePreferences: allModulePreferences,
    });
  };

  return (
    <div className="flex flex-col">
      <div className="my-4 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-600 pb-4">
          <label
            htmlFor="toggle-all"
            className="cursor-pointer font-bold text-background"
          >
            {t('usersettings.notifications.toggleAll')}
          </label>
          <Switch
            id="toggle-all"
            checked={allEnabled}
            onCheckedChange={handleToggleAll}
            disabled={isLoading}
          />
        </div>
        {AvailableNotificationModules.map((module) => {
          const switchId = `module-${module.id}`;

          return (
            <div
              key={module.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-background">
                <img
                  src={module.icon}
                  sizes={TABLE_ICON_SIZE}
                  className="h-5 w-5"
                  alt={t(module.labelKey)}
                />
                <label
                  htmlFor={switchId}
                  className="cursor-pointer"
                >
                  {t(module.labelKey)}
                </label>
              </div>
              <Switch
                id={switchId}
                checked={moduleSettings[module.id]}
                onCheckedChange={(checked) => handleToggle(module.id, checked)}
                disabled={isLoading}
              />
            </div>
          );
        })}
      </div>
      {hasChanges && (
        <div className="my-4 flex justify-end">
          <Button
            variant="btn-security"
            size="lg"
            onClick={handleSave}
            disabled={isLoading}
          >
            {t('common.save')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ModuleNotificationPreferences;
