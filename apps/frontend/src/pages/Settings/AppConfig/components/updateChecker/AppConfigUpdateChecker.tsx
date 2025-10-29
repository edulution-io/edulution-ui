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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import UPDATE_CHECKER_ENDPOINTS from '@libs/appconfig/constants/updateCheckerEndpoints';
import useAppConfigUpdateCheckerStore from './useAppConfigUpdateCheckerStore';
import ThemeVersionInfo from './ThemeVersionInfo';

type AppConfigUpdateCheckerProps = {
  option: AppConfigExtendedOption;
};

const AppConfigUpdateChecker: React.FC<AppConfigUpdateCheckerProps> = ({ option }) => {
  const { t } = useTranslation();
  const { isLoading, isUpdating, versionInfo, checkVersion, triggerUpdate } = useAppConfigUpdateCheckerStore();

  const baseEndpoint = UPDATE_CHECKER_ENDPOINTS[option.name];
  const path = option.value as string;

  useEffect(() => {
    void checkVersion(baseEndpoint, path, true);
  }, [baseEndpoint, path, checkVersion]);

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

      <div className="rounded-lg border border-border bg-card p-4">{renderContent()}</div>
    </div>
  );
};

export default AppConfigUpdateChecker;
