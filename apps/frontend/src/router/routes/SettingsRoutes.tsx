import React from 'react';
import { Route } from 'react-router-dom';
import AppConfigPage from '@/pages/Settings/AppConfig/AppConfigPage';
import { AppConfigDto } from '@libs/appconfig/types';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';

const getSettingsRoutes = (appConfigs: AppConfigDto[]) => [
  <Route
    key={SETTINGS_PATH}
    path={SETTINGS_PATH}
    element={<AppConfigPage />}
  >
    {appConfigs.map((item) => (
      <Route
        key={item.name}
        path={item.name}
        element={<AppConfigPage />}
      />
    ))}
  </Route>,
];

export default getSettingsRoutes;
