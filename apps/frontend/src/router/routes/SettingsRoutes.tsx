import React from 'react';
import { Route } from 'react-router-dom';
import AppConfigPage from '@/pages/Settings/AppConfig/AppConfigPage';
import { AppConfigDto } from '@libs/appconfig/types';

const getSettingsRoutes = (appConfigs: AppConfigDto[]) => [
  <Route
    key="settings"
    path="settings"
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
