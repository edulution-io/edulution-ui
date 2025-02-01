import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import CircleLoader from '@/components/ui/CircleLoader';

const AppConfigPage = lazy(() => import('@/pages/Settings/AppConfig/AppConfigPage'));

const getLazyAppConfigPage = () => (
  <Suspense fallback={<CircleLoader />}>
    <AppConfigPage />
  </Suspense>
);

const getSettingsRoutes = () => [
  <Route
    key={SETTINGS_PATH}
    path={SETTINGS_PATH}
    element={getLazyAppConfigPage()}
  >
    <Route
      path=":settingLocation"
      element={getLazyAppConfigPage()}
    />
  </Route>,
];

export default getSettingsRoutes;
