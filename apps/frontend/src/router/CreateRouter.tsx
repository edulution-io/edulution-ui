import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { HomePage } from '@/pages/Home';

import AppConfigPage from '@/pages/Settings/AppConfig/AppConfigPage';
import { AppConfigDto, AppIntegrationType, APPS } from '@libs/appconfig/types';
import getClassManagementRoutes from '@/router/routes/ClassManagementRoutes';
import { SECURITY_PATH, USER_SETTINGS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import UserSettingsSecurityPage from '@/pages/UserSettings/Security/UserSettingsSecurityPage';
import NativeAppPage from '@/pages/NativeAppPage/NativeAppPage';
import useLdapGroups from '@/hooks/useLdapGroups';
import getAuthRoutes from '@/router/routes/AuthRoutes';
import getSettingsRoutes from './routes/SettingsRoutes';
import getForwardedRoutes from './routes/ForwardedRoutes';
import getEmbeddedRoutes from './routes/EmbeddedRoutes';

const createRouter = (isAuthenticated: boolean, appConfigs: AppConfigDto[]) => {
  const { isSuperAdmin } = useLdapGroups();

  return createBrowserRouter(
    createRoutesFromElements(
      <>
        {getAuthRoutes(isAuthenticated)}
        {isAuthenticated ? (
          <>
            {getForwardedRoutes(appConfigs)}
            {getEmbeddedRoutes(appConfigs)}

            <Route element={<MainLayout />}>
              <Route
                path="/"
                element={<HomePage />}
              />
              <Route
                path={USER_SETTINGS_PATH}
                element={<Outlet />}
              >
                <Route
                  path=""
                  element={<UserSettingsSecurityPage />}
                />
                <Route
                  path={SECURITY_PATH}
                  element={<UserSettingsSecurityPage />}
                />
              </Route>
              {isSuperAdmin ? (
                <Route
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
                </Route>
              ) : null}
              {appConfigs.map((item) =>
                item.appType === AppIntegrationType.NATIVE ? (
                  <Route
                    key={item.name}
                    path={item.name}
                    element={<NativeAppPage page={item.name as APPS} />}
                  />
                ) : null,
              )}
              {getClassManagementRoutes()}
              {getSettingsRoutes(appConfigs)}
            </Route>
          </>
        ) : null}
      </>,
    ),
  );
};

export default createRouter;