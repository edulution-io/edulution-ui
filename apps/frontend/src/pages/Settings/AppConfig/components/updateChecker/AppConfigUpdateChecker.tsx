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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import UPDATE_CHECKER_ENDPOINTS from '@libs/appconfig/constants/updateCheckerEndpoints';
import useRequiredContainers from '@/pages/Settings/AppConfig/hooks/useRequiredContainers';
import useAppConfigUpdateCheckerStore from './useAppConfigUpdateCheckerStore';
import ThemeVersionInfo from './ThemeVersionInfo';

type AppConfigUpdateCheckerProps = {
  option: AppConfigExtendedOption;
};

const AppConfigUpdateChecker: React.FC<AppConfigUpdateCheckerProps> = ({ option }) => {
  const { t } = useTranslation();
  const { isLoading, isUpdating, versionInfo, checkVersion, triggerUpdate } = useAppConfigUpdateCheckerStore();
  const { hasFetched, isDisabled } = useRequiredContainers(option.requiredContainers);

  const baseEndpoint = UPDATE_CHECKER_ENDPOINTS[option.name];
  const path = option.value as string;

  useEffect(() => {
    void checkVersion(baseEndpoint, path, true);
  }, [baseEndpoint, path, checkVersion]);

  if (hasFetched && isDisabled) {
    return null;
  }

  const renderContent = () => {
    if (!versionInfo) {
      return <p className="text-center text-muted-foreground">{t('appExtendedOptions.updateChecker.noData')}</p>;
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <ThemeVersionInfo
            label={t('appExtendedOptions.updateChecker.currentVersion')}
            version={versionInfo.currentVersion}
            theme={versionInfo.currentTheme}
          />
          <ThemeVersionInfo
            label={t('appExtendedOptions.updateChecker.latestVersion')}
            version={versionInfo.latestVersion}
            theme={versionInfo.latestTheme}
          />
        </div>

        {versionInfo.isUpdateAvailable && (
          <div className="mx-auto w-64 rounded-md border border-primary p-3">
            <p className="text-center text-sm font-medium">{t('appExtendedOptions.updateChecker.updateAvailable')}</p>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            onClick={() => checkVersion(baseEndpoint, path)}
            disabled={isLoading}
            variant="btn-outline"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('appExtendedOptions.updateChecker.checkAgain')}
          </Button>

          <Button
            onClick={() => triggerUpdate(baseEndpoint, path)}
            disabled={isUpdating || isLoading}
            variant={versionInfo.isUpdateAvailable ? 'btn-collaboration' : 'btn-outline'}
            size="sm"
          >
            {isUpdating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {t('appExtendedOptions.updateChecker.updateNow')}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {option.title && <p className="font-bold">{t(option.title)}</p>}
      {option.description && <p className="text-sm text-muted-foreground">{t(option.description)}</p>}

      <div className="rounded-xl border border-border bg-card p-4">{renderContent()}</div>
    </div>
  );
};

export default AppConfigUpdateChecker;
