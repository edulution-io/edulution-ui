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

import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnClickOutside } from 'usehooks-ts';
import { useTranslation } from 'react-i18next';
import { AppStoreIcon } from '@/assets/icons';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { Card } from '@/components/shared/Card';
import cn from '@libs/common/utils/className';
import type AppConfigOption from '@libs/appconfig/types/appConfigOption';
import APPS from '@libs/appconfig/constants/apps';
import AppConfigDto from '@libs/appconfig/types/appConfigDto';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import APP_CONFIG_OPTIONS from '../appConfigOptions';
import AddAppConfigDialog from '../AddAppConfigDialog';
import AppStoreFloatingButtons from './AppStoreFloatingButtons';
import useAppConfigsStore from '../appConfigsStore';

const emptyAppConfigOption = { id: APPS.NONE, icon: '', isNativeApp: false };

const AppStorePage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedApp, setSelectedApp] = useState<AppConfigOption>(emptyAppConfigOption);
  const appFieldRef = useRef<HTMLDivElement>(null);
  const { appConfigs, error, setIsAddAppConfigDialogOpen, createAppConfig } = useAppConfigsStore();
  const navigate = useNavigate();

  useOnClickOutside(appFieldRef, () => setSelectedApp(emptyAppConfigOption));

  const filteredAppOptions = useMemo(() => {
    const existingOptions = appConfigs.map((item) => item.name);
    const filteredOptions = APP_CONFIG_OPTIONS.filter((item) => !existingOptions.includes(item.id));
    return filteredOptions.map((item) => item.id);
  }, [appConfigs]);

  const handleCreateApp = () => {
    if (selectedApp.isNativeApp) {
      const newConfig: AppConfigDto = {
        name: selectedApp.id,
        icon: selectedApp.icon,
        appType: APP_INTEGRATION_VARIANT.NATIVE,
        options: {},
        accessGroups: [],
        extendedOptions: {},
      };

      void createAppConfig(newConfig);
      if (!error) {
        navigate(`/${SETTINGS_PATH}/${selectedApp.id}`);
      }
    } else {
      setIsAddAppConfigDialogOpen(true);
    }
  };

  return (
    <>
      <NativeAppHeader
        title={t('appstore.title')}
        description={t('appstore.description')}
        iconSrc={AppStoreIcon}
      />
      <div
        className="space-4 flex max-w-full flex-wrap gap-4 overflow-y-auto overflow-x-visible scrollbar-thin"
        ref={appFieldRef}
      >
        {APP_CONFIG_OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedApp(item)}
            disabled={!filteredAppOptions.includes(item.id)}
          >
            <Card
              key={item.id}
              className={cn(
                'flex h-32 w-48 flex-col items-center',
                selectedApp.id === item.id ? 'bg-ciGreenToBlue' : '',
                !filteredAppOptions.includes(item.id) ? 'opacity-50' : '',
              )}
              variant="text"
            >
              <div className="m-4 flex flex-col items-center">
                <img
                  src={item.icon}
                  alt={item.id}
                  className="h-16 w-16"
                />
                <p>{t(`${item.id}.sidebar`)}</p>
              </div>
            </Card>
          </button>
        ))}
        <AppStoreFloatingButtons handleCreateApp={handleCreateApp} />
      </div>
      <AddAppConfigDialog />
    </>
  );
};
export default AppStorePage;
