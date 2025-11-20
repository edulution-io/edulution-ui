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

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppStoreIcon } from '@/assets/icons';
import { Card } from '@/components/shared/Card';
import cn from '@libs/common/utils/className';
import type AppConfigOption from '@libs/appconfig/types/appConfigOption';
import APPS from '@libs/appconfig/constants/apps';
import AppConfigDto from '@libs/appconfig/types/appConfigDto';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import APP_CONFIG_OPTION_KEYS from '@libs/appconfig/constants/appConfigOptionKeys';
import PageLayout from '@/components/structure/layout/PageLayout';
import APPLICATION_NAME from '@libs/common/constants/applicationName';
import APP_CONFIG_OPTIONS from '../appConfigOptions';
import AddAppConfigDialog from '../AddAppConfigDialog';
import AppStoreFloatingButtons from './AppStoreFloatingButtons';
import useAppConfigsStore from '../useAppConfigsStore';

const emptyAppConfigOption = { id: APPS.NONE, icon: '', isNativeApp: false };

const AppStorePage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedApp, setSelectedApp] = useState<AppConfigOption>(emptyAppConfigOption);
  const { appConfigs, error, setIsAddAppConfigDialogOpen, createAppConfig } = useAppConfigsStore();
  const navigate = useNavigate();

  const filteredAppOptions = useMemo(() => {
    const existingOptions = appConfigs.map((item) => item.name);
    const filteredOptions = APP_CONFIG_OPTIONS.filter((item) => !existingOptions.includes(item.id));
    return filteredOptions.map((item) => item.id);
  }, [appConfigs]);

  const getDisabledState = (appConfig: AppConfigOption) => !filteredAppOptions.includes(appConfig.id);

  const handleCreateApp = () => {
    if (selectedApp.isNativeApp) {
      const { options = [], extendedOptions = {} } = selectedApp;
      const newExtendedOptions = Object.values(extendedOptions).reduce<Record<string, string>>((acc, item) => {
        acc[item[0].name] = '';
        return acc;
      }, {});

      const newConfig: AppConfigDto = {
        name: selectedApp.id,
        icon: selectedApp.icon,
        appType: APP_INTEGRATION_VARIANT.NATIVE,
        options: {
          url: options.includes(APP_CONFIG_OPTION_KEYS.URL) ? '' : undefined,
          apiKey: options.includes(APP_CONFIG_OPTION_KEYS.APIKEY) ? '' : undefined,
          proxyConfig: options.includes(APP_CONFIG_OPTION_KEYS.PROXYCONFIG) ? '""' : undefined,
        },
        accessGroups: [],
        extendedOptions: newExtendedOptions,
        position: 0,
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
    <PageLayout
      nativeAppHeader={{
        title: t('appstore.title'),
        description: t('appstore.description', { applicationName: APPLICATION_NAME }),
        iconSrc: AppStoreIcon,
      }}
    >
      <div className="space-2 flex max-h-[27rem] w-full flex-wrap gap-2 overflow-y-auto scrollbar-thin md:max-h-[36rem]">
        {APP_CONFIG_OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => (selectedApp.id === item.id ? setSelectedApp(emptyAppConfigOption) : setSelectedApp(item))}
            disabled={getDisabledState(item)}
          >
            <Card
              key={item.id}
              className={cn(
                'm-1 flex h-32 w-32 flex-col items-center overflow-hidden ease-in-out md:w-48 lg:transition-transform lg:duration-300 2xl:hover:scale-105',
                selectedApp.id === item.id ? 'scale-105 bg-ciGreenToBlue' : '',
                getDisabledState(item) ? 'opacity-50' : '',
              )}
              variant="text"
            >
              <div className="m-4 flex flex-col items-center">
                <img
                  src={item.icon}
                  alt={item.id}
                  className="h-12 w-12 md:h-14 md:w-14"
                />
                <p>{t(`${item.id}.sidebar`)}</p>
              </div>
            </Card>
          </button>
        ))}
      </div>
      <AppStoreFloatingButtons
        handleCreateApp={handleCreateApp}
        selectedApp={selectedApp}
      />
      <AddAppConfigDialog selectedApp={selectedApp} />
    </PageLayout>
  );
};
export default AppStorePage;
