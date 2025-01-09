import React from 'react';
import { Route } from 'react-router-dom';
import AppConfigPage from '@/pages/Settings/AppConfig/AppConfigPage';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';

const getSettingsRoutes = () => [
  <Route
    key={SETTINGS_PATH}
    path={SETTINGS_PATH}
    element={<AppConfigPage />}
  >
    <Route
      path=":settingLocation"
      element={<AppConfigPage />}
    />
  </Route>,
];

export default getSettingsRoutes;
