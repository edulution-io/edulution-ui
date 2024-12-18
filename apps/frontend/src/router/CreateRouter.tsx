import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route } from 'react-router-dom';
import { AppConfigDto } from '@libs/appconfig/types';
import type TApps from '@libs/appconfig/types/appsType';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import {
  LANGUAGE_PATH,
  MAILS_PATH,
  SECURITY_PATH,
  USER_DETAILS_PATH,
  USER_SETTINGS_PATH,
} from '@libs/userSettings/constants/user-settings-endpoints';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import useLdapGroups from '@/hooks/useLdapGroups';
import getAuthRoutes from '@/router/routes/AuthRoutes';
import getPublicRoutes from '@/router/routes/PublicRoutes';
import getSettingsRoutes from '@/router/routes/SettingsRoutes';
import getForwardedRoutes from '@/router/routes/ForwardedRoutes';
import getEmbeddedRoutes from '@/router/routes/EmbeddedRoutes';
import getClassManagementRoutes from '@/router/routes/ClassManagementRoutes';
import { HomePage } from '@/pages/Home';
import NativeAppPage from '@/pages/NativeAppPage/NativeAppPage';
import AppConfigPage from '@/pages/Settings/AppConfig/AppConfigPage';
import UserSettingsMailsPage from '@/pages/UserSettings/Mails/UserSettingsMailsPage';
import UserSettingsDetailsPage from '@/pages/UserSettings/Details/UserSettingsDetailsPage';
import UserSettingsSecurityPage from '@/pages/UserSettings/Security/UserSettingsSecurityPage';
import LanguageSettingsPage from '@/pages/UserSettings/Language/LanguageSettingsPage';
import FileViewer from '@/pages/FileSharing/previews/FileViewer';
import getSurveyRoutes from '@/pages/Surveys/SurveyRoutes';
import EmptyLayout from '@/components/layout/EmptyLayout';
import MainLayout from '@/components/layout/MainLayout';

const createRouter = (isAuthenticated: boolean, appConfigs: AppConfigDto[]) => {
  const { isSuperAdmin } = useLdapGroups();

  return createBrowserRouter(
    createRoutesFromElements(
      <>
        {getPublicRoutes()}
        {getAuthRoutes(isAuthenticated)}
        {isAuthenticated ? (
          <>
            <Route element={<EmptyLayout />}>
              <Route
                path="/onlyoffice"
                element={
                  <FileViewer
                    mode="edit"
                    editWindow
                  />
                }
              />
            </Route>
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
                <Route
                  path={USER_DETAILS_PATH}
                  element={<UserSettingsDetailsPage />}
                />
                <Route
                  path={MAILS_PATH}
                  element={<UserSettingsMailsPage />}
                />
                <Route
                  path={LANGUAGE_PATH}
                  element={<LanguageSettingsPage />}
                />
              </Route>
              {isSuperAdmin ? (
                <Route
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
                </Route>
              ) : null}
              {appConfigs.map((item) =>
                item.appType === APP_INTEGRATION_VARIANT.NATIVE ? (
                  <Route
                    key={item.name}
                    path={item.name}
                    element={<NativeAppPage page={item.name as TApps} />}
                  />
                ) : null,
              )}
              {getClassManagementRoutes()}
              {getSurveyRoutes()}
              {getSettingsRoutes(appConfigs)}
            </Route>
          </>
        ) : null}
      </>,
    ),
  );
};

export default createRouter;
